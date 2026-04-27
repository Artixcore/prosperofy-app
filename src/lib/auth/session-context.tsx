"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type { AuthSuccessPayload, AuthUser } from "@/lib/api/types";
import { isApiClientError } from "@/lib/api/errors";
import { clearAuthCookie, readAuthCookie, setAuthCookie } from "@/lib/auth/cookies";
import {
  clearSessionStorage,
  loadSession,
  saveSession,
  type StoredSession,
} from "@/lib/auth/storage";
import { AUTH_UNAUTHORIZED_EVENT } from "@/lib/api/client";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  hydrated: boolean;
  login: (payload: AuthSuccessPayload) => void;
  logout: () => Promise<void>;
  setFromSession: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const applySession = useCallback((s: StoredSession) => {
    setUser(s.user);
    setToken(s.token);
    saveSession(s);
    setAuthCookie();
  }, []);

  const setFromSession = useCallback(() => {
    const s = loadSession();
    if (s) {
      setUser(s.user);
      setToken(s.token);
    } else {
      setUser(null);
      setToken(null);
    }
  }, []);

  useEffect(() => {
    const s = loadSession();
    const cookieOk = readAuthCookie();
    if (!s && cookieOk) {
      clearAuthCookie();
    }
    if (s) {
      setUser(s.user);
      setToken(s.token);
      if (!cookieOk) setAuthCookie();
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    function onUnauthorized() {
      clearSessionStorage();
      clearAuthCookie();
      setUser(null);
      setToken(null);
      router.replace("/login");
    }

    if (typeof window === "undefined") return;
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized);
    return () => {
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized);
    };
  }, [router]);

  const login = useCallback(
    (payload: AuthSuccessPayload) => {
      applySession({ token: payload.token, user: payload.user });
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    const t = loadSession()?.token ?? token;
    clearSessionStorage();
    setUser(null);
    setToken(null);
    clearAuthCookie();
    if (t) {
      try {
        await laravelFetch<{ revoked: boolean }>(API.auth.logout, {
          method: "POST",
          token: t,
        });
      } catch (e) {
        if (!isApiClientError(e) || e.status !== 401) {
          console.warn("Logout request failed", e);
        }
      }
    }
    router.replace("/login");
  }, [router, token]);

  const value = useMemo(
    () => ({
      user,
      token,
      hydrated,
      login,
      logout,
      setFromSession,
    }),
    [user, token, hydrated, login, logout, setFromSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
