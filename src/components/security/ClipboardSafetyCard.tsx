"use client";

import { Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { InlineAlert } from "@/components/system/inline-alert";
import { useToast } from "@/components/system/toast-context";
import { generateSafeClipboardText } from "@/lib/security/generate-safe-clipboard-text";

export type ClipboardSafetyCardProps = {
  visible: boolean;
  title?: string;
  description?: string;
};

const DEFAULT_TITLE = "Protect your Binance API secret";
const DEFAULT_DESCRIPTION =
  "Your Binance secret may still be in your clipboard after pasting it. Copy this harmless text to replace it. This helps reduce the chance of accidentally pasting your secret somewhere else.";
const CLIPBOARD_SAFETY_HEADING =
  "Clipboard safety: If your Binance API secret is still copied, click the copy button below to replace your clipboard with harmless text.";

export function ClipboardSafetyCard({
  visible,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
}: ClipboardSafetyCardProps) {
  const { pushToast } = useToast();
  const [safeText, setSafeText] = useState("");
  const [copyFailed, setCopyFailed] = useState(false);

  useEffect(() => {
    if (visible) {
      setSafeText(generateSafeClipboardText());
      setCopyFailed(false);
    }
  }, [visible]);

  if (!visible) {
    return null;
  }

  async function handleCopySafeText() {
    setCopyFailed(false);
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("clipboard_unavailable");
      }
      await navigator.clipboard.writeText(safeText);
      pushToast({
        tone: "success",
        title: "Clipboard replaced with safe text.",
      });
    } catch {
      setCopyFailed(true);
    }
  }

  return (
    <section
      className="rounded-lg border border-amber-300/60 bg-amber-50/80 p-4 dark:border-amber-900/50 dark:bg-amber-950/30"
      aria-labelledby="clipboard-safety-title"
    >
      <h4 id="clipboard-safety-title" className="text-sm font-semibold text-foreground">
        {title}
      </h4>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <p className="mt-3 text-xs font-medium text-foreground">{CLIPBOARD_SAFETY_HEADING}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        For stronger safety, also avoid pasting your secret anywhere else.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          readOnly
          value={safeText}
          aria-label="Harmless clipboard replacement text"
          className="min-w-0 flex-1 rounded-md border border-input bg-surface px-3 py-2 font-mono text-xs text-foreground"
          onFocus={(e) => e.target.select()}
        />
        <button
          type="button"
          aria-label="Replace clipboard with safe text"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
          onClick={() => void handleCopySafeText()}
        >
          <Copy className="h-3.5 w-3.5" aria-hidden />
          Copy safe text
        </button>
      </div>

      {copyFailed ? (
        <InlineAlert tone="error">
          Could not access clipboard automatically. Please copy the safe text manually.
        </InlineAlert>
      ) : null}
    </section>
  );
}
