export function SubmitButton({
  pending,
  children,
  className = "",
}: {
  pending?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 motion-safe:transition-[filter] ${className}`}
    >
      {pending ? "Please wait…" : children}
    </button>
  );
}
