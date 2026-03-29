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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="presentation"
          onClick={() => !pending && setOpen(false)}
        >
          <div
            className="max-w-md rounded-lg border border-surface-border bg-surface p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="confirm-title" className="text-lg font-semibold text-white">
              {title}
            </h2>
            <p className="mt-2 text-sm text-zinc-400">{description}</p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-1.5 text-sm text-zinc-300 hover:bg-surface-raised"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => void handleConfirm()}
                className={`rounded-md px-3 py-1.5 text-sm font-medium text-white ${
                  tone === "danger"
                    ? "bg-red-700 hover:bg-red-600"
                    : "bg-accent hover:bg-indigo-500"
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
