"use client";

import { useEffect } from "react";
import Link from "next/link";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 p-6">
      <h1 className="text-lg font-semibold text-foreground">Unable to load this page</h1>
      <p className="text-sm text-muted-foreground">
        Something went wrong while rendering this section. Your session is still active — try
        again or choose another area.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Try again
        </button>
        <Link href="/dashboard" className="rounded-lg border border-border px-4 py-2 text-sm font-medium">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
