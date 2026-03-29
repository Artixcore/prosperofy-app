"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { InlineAlert } from "@/components/system/inline-alert";
import { SubmitButton } from "@/components/system/submit-button";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  function handlePlaceholderSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Client-side preferences until Laravel exposes user settings APIs."
      />
      {saved ? (
        <InlineAlert tone="success">Preference saved locally (demo).</InlineAlert>
      ) : null}
      <form
        onSubmit={handlePlaceholderSave}
        className="mt-6 max-w-md space-y-4 rounded-lg border border-surface-border bg-surface-raised/40 p-6"
      >
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input type="checkbox" className="rounded border-surface-border" defaultChecked />
          Email notifications (local only)
        </label>
        <SubmitButton>Save preferences</SubmitButton>
      </form>
    </>
  );
}
