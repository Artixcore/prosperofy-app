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
      className={`inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {pending ? "Please wait…" : children}
    </button>
  );
}
