import Link from "next/link";

export default function ResetPasswordPage() {
  return (
    <div className="rounded-xl border border-surface-border bg-surface-elevated p-8 shadow-soft">
      <h1 className="text-xl font-semibold text-content-primary">Reset password</h1>
      <p className="mt-2 text-sm text-content-muted">
        This page is ready for token-based reset form wiring when backend reset routes are enabled.
      </p>
      <Link href="/login" className="mt-6 inline-block text-sm text-accent-muted hover:underline">
        Back to sign in
      </Link>
    </div>
  );
}
