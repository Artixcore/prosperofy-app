import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="rounded-xl border border-surface-border bg-surface-elevated p-8 shadow-soft">
      <h1 className="text-xl font-semibold text-content-primary">Forgot password</h1>
      <p className="mt-2 text-sm text-content-muted">
        Password reset endpoint can be connected to Laravel mail flow. Contact support if needed.
      </p>
      <Link href="/login" className="mt-6 inline-block text-sm text-accent-muted hover:underline">
        Back to sign in
      </Link>
    </div>
  );
}
