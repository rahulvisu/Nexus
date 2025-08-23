import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { API_URL } from "@/lib/api";

export type User = { id: string; username: string; email: string; rating: number };

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Validate token on app load
  useEffect(() => {
    const validateToken = async () => {
      const stored = localStorage.getItem("auth");
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as { user: User; token: string };
          
          // Validate token with backend
          const res = await fetch(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${parsed.token}` },
          });
          
          if (res.ok) {
            const userData = await res.json();
            setUser(userData.user);
            setToken(parsed.token);
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem("auth");
            setUser(null);
            setToken(null);
          }
        } catch {
          // Parsing failed or network error, clear storage
          localStorage.removeItem("auth");
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    validateToken();
  }, []);

  const persist = (u: User, t: string) => {
    setUser(u);
    setToken(t);
    localStorage.setItem("auth", JSON.stringify({ user: u, token: t }));
  };

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error((await res.json()).message || "Login failed");
    const data = await res.json();
    persist(data.user as User, data.token as string);
  };

  const register = async (username: string, email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    if (!res.ok) throw new Error((await res.json()).message || "Registration failed");
    const data = await res.json();
    persist(data.user as User, data.token as string);
  };

  const logout = () => {
    localStorage.removeItem("auth");
    setUser(null);
    setToken(null);
  };

  const value = useMemo(() => ({ user, token, isAuthenticated: !!token, isLoading, login, register, logout }), [user, token, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
