"use client";

import { PageHeader } from "@/components/page-header";
import { useAuth } from "@/lib/auth/session-context";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <>
      <PageHeader
        title="Profile"
        description="Profile data comes from your session after login. A future Laravel endpoint can refresh this."
      />
      <dl className="max-w-md space-y-4 rounded-lg border border-surface-border bg-surface-raised/40 p-6">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">Name</dt>
          <dd className="mt-1 text-sm text-white">{user?.name ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">Email</dt>
          <dd className="mt-1 text-sm text-white">{user?.email ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">User ID</dt>
          <dd className="mt-1 font-mono text-sm text-zinc-300">{user?.id ?? "—"}</dd>
        </div>
      </dl>
    </>
  );
}
