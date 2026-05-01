"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type ThemeMode } from "@/lib/theme/theme-context";

const options: Array<{ key: ThemeMode; label: string; Icon: typeof Sun }> = [
  { key: "light", label: "Light", Icon: Sun },
  { key: "dark", label: "Dark", Icon: Moon },
  { key: "system", label: "System", Icon: Monitor },
];

type ThemeToggleProps = {
  variant?: "default" | "compact";
};

export function ThemeToggle({ variant = "default" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  if (variant === "compact") {
    return (
      <div className="inline-flex shrink-0 rounded-lg border border-surface-border bg-surface-elevated p-0.5 shadow-soft motion-safe:transition-shadow">
        {options.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTheme(key)}
            className={`rounded-md p-1.5 motion-safe:transition-colors ${
              theme === key
                ? "bg-surface-raised text-content-primary"
                : "text-content-muted hover:bg-surface-raised/70 hover:text-content-primary"
            }`}
            aria-label={`Use ${label} theme`}
            aria-pressed={theme === key}
          >
            <Icon className="h-4 w-4" aria-hidden />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="inline-flex rounded-xl border border-surface-border bg-surface-elevated p-1 shadow-soft">
      {options.map(({ key, label, Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => setTheme(key)}
          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs motion-safe:transition-colors ${
            theme === key
              ? "bg-surface-raised text-content-primary"
              : "text-content-muted hover:text-content-primary"
          }`}
          aria-label={`Use ${label} theme`}
          aria-pressed={theme === key}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden />
          {label}
        </button>
      ))}
    </div>
  );
}
