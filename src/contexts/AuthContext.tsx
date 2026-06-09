"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface User {
  _id: string;
  email: string;
  name: string;
  role: "admin" | "user";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get("/auth/me");

    
      setUser(response.data.data);
    } catch (error) {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      setUser(user);

      toast.success("Login successful!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed");
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      setUser(user);

      toast.success("Registration successful!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed");
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};