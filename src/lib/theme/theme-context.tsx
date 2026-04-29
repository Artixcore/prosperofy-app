"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  useThemePreferenceQuery,
  useUpdateThemePreferenceMutation,
} from "@/features/app/use-theme-preference";

export type ThemeMode = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");
  const themeQuery = useThemePreferenceQuery();
  const updateTheme = useUpdateThemePreferenceMutation();

  useEffect(() => {
    setSystemTheme(getSystemTheme());
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemTheme(getSystemTheme());
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (themeQuery.data?.theme_preference) {
      setThemeState(themeQuery.data.theme_preference);
      localStorage.setItem("prosperofy-theme", themeQuery.data.theme_preference);
      return;
    }
    const local = localStorage.getItem("prosperofy-theme");
    if (local === "light" || local === "dark" || local === "system") {
      setThemeState(local);
    }
  }, [themeQuery.data?.theme_preference]);

  const resolvedTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const setTheme = useCallback((nextTheme: ThemeMode) => {
    setThemeState(nextTheme);
    localStorage.setItem("prosperofy-theme", nextTheme);
    if (themeQuery.isSuccess) {
      updateTheme.mutate(nextTheme);
    }
  }, [themeQuery.isSuccess, updateTheme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [theme, resolvedTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
