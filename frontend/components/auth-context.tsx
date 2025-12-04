'use client';

import React, { createContext, useContext, useEffect, useState } from "react";

type AuthState = {
  token: string | null;
  userId: string | null;
  role: "creator" | "learner" | null;
  name: string | null;
};

type AuthContextValue = AuthState & {
  setAuth: (state: AuthState) => void;
  clearAuth: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function decodeJwt(token: string): any | null {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

const STORAGE_KEY = "bite-sized-auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    userId: null,
    role: null,
    name: null
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as AuthState;
        setState(parsed);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const setAuth = (next: AuthState) => {
    setState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  };

  const clearAuth = () => {
    setState({ token: null, userId: null, role: null, name: null });
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  const value: AuthContextValue = { ...state, setAuth, clearAuth };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export async function loginAndExtract(token: string): Promise<AuthState> {
  const payload = decodeJwt(token);
  return {
    token,
    userId: payload?.sub ?? null,
    role: (payload?.role as "creator" | "learner" | undefined) ?? null,
    name: (payload?.name as string | undefined) ?? null
  };
}



