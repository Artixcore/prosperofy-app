"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type ThemeMode } from "@/lib/theme/theme-context";

const options: Array<{ key: ThemeMode; label: string; Icon: typeof Sun }> = [
  { key: "light", label: "Light", Icon: Sun },
  { key: "dark", label: "Dark", Icon: Moon },
  { key: "system", label: "System", Icon: Monitor },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="inline-flex rounded-xl border border-surface-border bg-surface-elevated p-1 shadow-soft">
      {options.map(({ key, label, Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => setTheme(key)}
          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs transition ${
            theme === key
              ? "bg-surface-raised text-content-primary"
              : "text-content-muted hover:text-content-primary"
          }`}
          aria-label={`Use ${label} theme`}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
