"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type ToastTone = "success" | "error" | "warning" | "info";

type ToastItem = {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
  persistent?: boolean;
};

type ToastInput = Omit<ToastItem, "id">;

type ToastContextValue = {
  pushToast: (item: ToastInput) => void;
  dismissToast: (id: string) => void;
};

const toneClasses: Record<ToastTone, string> = {
  success:
    "border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-900/55 dark:bg-emerald-950/40 dark:text-emerald-50",
  error:
    "border-red-300 bg-red-50 text-red-950 dark:border-red-900/55 dark:bg-red-950/40 dark:text-red-50",
  warning:
    "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-900/55 dark:bg-amber-950/40 dark:text-amber-50",
  info: "border-border bg-muted text-foreground",
};

const ToastContext = createContext<ToastContextValue | null>(null);

function makeId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const pushToast = useCallback((item: ToastInput) => {
    const id = makeId();
    setItems((current) => [...current, { ...item, id }]);
    if (!item.persistent) {
      window.setTimeout(() => {
        setItems((current) => current.filter((entry) => entry.id !== id));
      }, 5000);
    }
  }, []);

  const value = useMemo(() => ({ pushToast, dismissToast }), [dismissToast, pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-3 top-3 z-[80] flex w-[calc(100%-1.5rem)] max-w-sm flex-col gap-2 sm:right-4 sm:top-4">
        {items.map((item) => (
          <div
            key={item.id}
            role="status"
            className={`pointer-events-auto rounded-xl border p-3 shadow-soft ${toneClasses[item.tone]}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{item.title}</p>
                {item.description ? (
                  <p className="mt-1 text-sm font-normal leading-snug text-current">{item.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(item.id)}
                className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-current underline-offset-2 hover:bg-foreground/10 hover:underline dark:hover:bg-foreground/15"
                aria-label="Dismiss alert"
              >
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
