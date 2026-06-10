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
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<string>;
  register: (name: string, email: string, password: string) => Promise<string>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Cookie helpers ──
const setTokenCookie = (token: string) => {
  document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
};

const removeTokenCookie = () => {
  document.cookie = "token=; path=/; max-age=0";
};

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
      const userData = response.data?.data ?? response.data?.user ?? null;
      setUser(userData);
    } catch {
      localStorage.removeItem("token");
      removeTokenCookie();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<string> => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const token = response.data?.token;
      const userData: User = response.data?.user ?? response.data?.data;

      if (!token || !userData) throw new Error("Invalid response from server");

      // Save to both localStorage (api interceptor) + cookie (middleware)
      localStorage.setItem("token", token);
      setTokenCookie(token);
      setUser(userData);
      toast.success("Login successful!");

      return userData.role;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || "Login failed";
      toast.error(message);
      throw error;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<string> => {
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });
      const token = response.data?.token;
      const userData: User = response.data?.user ?? response.data?.data;

      if (!token || !userData) throw new Error("Invalid response from server");

      localStorage.setItem("token", token);
      setTokenCookie(token);
      setUser(userData);
      toast.success("Registration successful!");

      return userData.role; // ← role return cheyyunnu
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || "Registration failed";
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    removeTokenCookie();
    setUser(null);
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
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