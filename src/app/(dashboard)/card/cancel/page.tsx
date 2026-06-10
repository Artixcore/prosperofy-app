import Link from "next/link";

export default function CardCancelPage() {
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-xl font-semibold text-foreground">Payment was cancelled</h1>
      <p className="text-sm text-muted-foreground">
        You can restart the card payment anytime.
      </p>
      <Link
        href="/card"
        className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        Back to Prosperity Card
      </Link>
    </div>
  );
}
