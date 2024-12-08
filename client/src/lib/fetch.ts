type FetchParams = {
  url: string;
  method: string;
  requestBody?: unknown;
};

export type ApiResponse<T> = {
  success?: T;
  error?: {
    status: number;
    message: string;
  };
};

class HttpError extends Error {
  public response: Response;

  constructor(response: Response) {
    super(`HTTP Error: ${response.status} ${response.statusText}`);
    this.response = response;
  }

  async getErrorMessage(): Promise<string> {
    try {
      const errorBody = await this.response.json();
      return (
        errorBody.message || this.response.statusText || "an error occurred"
      );
    } catch {
      const text = await this.response.text();
      return text || this.response.statusText || "an error occurred";
    }
  }
}

export async function fetchRequest<T>(
  params: FetchParams,
): Promise<ApiResponse<T>> {
  const { url, method, requestBody } = params;

  const fetchOptions: RequestInit = {
    method: method.toUpperCase(),
    credentials: "include",
  };

  if (requestBody) {
    fetchOptions.headers = {
      "Content-Type": "application/json",
      ...(fetchOptions.headers || {}), // Preserve existing headers
    };
    fetchOptions.body = JSON.stringify(requestBody);
  }

  let response: Response;

  try {
    response = await fetch(url, {
      ...fetchOptions,
      signal: AbortSignal.timeout(3000), // Set timeout for the fetch call
    });

    if (!response.ok) {
      throw new HttpError(response);
    }

    const contentLength = response.headers.get("content-length");

    if (contentLength && contentLength !== "0") {
      try {
        const responseBody = await response.json();
        return { success: responseBody };
      } catch {
        return {
          error: { status: 500, message: "failed to parse JSON response" },
        };
      }
    } else {
      return { success: response as T };
    }
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return { error: { status: 408, message: "request timed-out" } };
    }

    if (err instanceof HttpError) {
      const errorMessage = await err.getErrorMessage();
      return {
        error: {
          status: err.response.status,
          message: errorMessage,
        },
      };
    }

    if (err instanceof Error) {
      return { error: { status: 500, message: err.message } };
    }

    return { error: { status: 500, message: "server error occurred" } };
  }
}
