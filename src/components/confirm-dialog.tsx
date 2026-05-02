"use client";

import { useState, type ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
  onConfirm: () => void | Promise<void>;
  children: (open: () => void) => ReactNode;
};

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  onConfirm,
  children,
}: Props) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleConfirm() {
    setPending(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      {children(() => setOpen(true))}
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-[2px]"
          role="presentation"
          onClick={() => !pending && setOpen(false)}
        >
          <div
            className="max-w-md rounded-lg border border-border bg-card p-6 text-card-foreground shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="confirm-title" className="text-lg font-semibold text-card-foreground">
              {title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-1.5 text-sm text-secondary-foreground hover:bg-secondary"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => void handleConfirm()}
                className={`rounded-md px-3 py-1.5 text-sm font-medium motion-safe:transition-[filter] hover:brightness-110 ${
                  tone === "danger"
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {pending ? "…" : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
