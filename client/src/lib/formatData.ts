export function formatDate(
  dateString: string,
  locale: string = "en-US",
  options: Intl.DateTimeFormatOptions = {},
): string {
  const date = new Date(dateString);

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  };

  const formatter = new Intl.DateTimeFormat(locale, {
    ...defaultOptions,
    ...options,
  });

  return formatter.format(date);
}
