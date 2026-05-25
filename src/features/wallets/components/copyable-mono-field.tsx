"use client";

import type { MouseEvent } from "react";
import { useToast } from "@/components/system/toast-context";

type CopyableMonoFieldProps = {
  label: string;
  value: string | null | undefined;
  shorten?: (value: string) => string;
  className?: string;
  stopPropagation?: boolean;
};

export function CopyableMonoField({
  label,
  value,
  shorten,
  className = "",
  stopPropagation = false,
}: CopyableMonoFieldProps) {
  const { pushToast } = useToast();
  const raw = value?.trim() ?? "";

  async function handleCopy(e: MouseEvent) {
    if (stopPropagation) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!raw) return;
    try {
      await navigator.clipboard.writeText(raw);
      pushToast({ tone: "success", title: "Copied", description: `${label} copied.` });
    } catch {
      pushToast({ tone: "error", title: "Copy failed", description: "Could not copy to clipboard." });
    }
  }

  if (!raw) {
    return (
      <div className={className}>
        <span className="text-content-muted">{label}:</span> <span className="text-content-muted">—</span>
      </div>
    );
  }

  const display = shorten ? shorten(raw) : raw;

  return (
    <div className={`flex flex-wrap items-start justify-between gap-2 ${className}`}>
      <div className="min-w-0 flex-1">
        <span className="text-content-muted">{label}:</span>{" "}
        <span className="break-all font-mono text-xs" title={raw}>
          {display}
        </span>
      </div>
      <button
        type="button"
        onClick={(e) => void handleCopy(e)}
        className="shrink-0 rounded border border-surface-border px-2 py-0.5 text-xs hover:bg-surface-muted"
      >
        Copy
      </button>
    </div>
  );
}
