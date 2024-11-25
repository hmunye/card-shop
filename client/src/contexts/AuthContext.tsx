import { fetchRequest } from "@/lib/fetch";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router";

interface AuthContextType {
  isAuthenticated: boolean;
  name: string;
  userId: string;
  checkAuth: () => Promise<void>;
  logOut: () => Promise<void>;
}

interface CheckResponse {
  name: string;
  user_id: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [userId, setUserID] = useState<string>("");

  useEffect(() => {
    const checkToken = async () => {
      const response = await fetchRequest<CheckResponse>({
        url: "http://localhost:8080/api/auth/check",
        method: "GET",
      });

      if (response.error) {
        setIsAuthenticated(false);
        setName("");
        setUserID("");
        return;
      }

      setIsAuthenticated(true);
      setName(response.success!.name);
      setUserID(response.success!.user_id);
    };

    checkToken();
  }, []);

  const checkAuth = async () => {
    const response = await fetchRequest<CheckResponse>({
      url: "http://localhost:8080/api/auth/check",
      method: "GET",
    });

    if (response.error) {
      setIsAuthenticated(false);
      setName("");
      setUserID("");
    } else {
      setIsAuthenticated(true);
      setName(response.success!.name);
      setUserID(response.success!.user_id);
    }
  };

  const logOut = async () => {
    const response = await fetchRequest({
      url: "http://localhost:8080/api/auth/logout",
      method: "POST",
    });

    if (response.error) {
      console.log(response.error.message);
      return;
    }

    setIsAuthenticated(false);
    setName("");
    setUserID("");
    navigate("/auth/sign-in");
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, name, checkAuth, logOut, userId }}
    >
      {children}
    </AuthContext.Provider>
  );
};
