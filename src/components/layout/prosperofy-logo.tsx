import Link from "next/link";

type Props = {
  variant?: "full" | "mark";
  linkToDashboard?: boolean;
  className?: string;
};

export function ProsperofyLogo({ variant = "full", linkToDashboard = true, className = "" }: Props) {
  const src = variant === "mark" ? "/prosperofy-mark.svg" : "/prosperofy-logo.svg";
  const imgClass =
    variant === "mark" ? "h-8 w-8" : "h-8 w-auto max-w-full text-content-primary";

  /* eslint-disable @next/next/no-img-element -- static SVG branding; next/image adds no benefit */
  const img =
    variant === "mark" ? (
      <img src={src} alt="" aria-hidden className={imgClass} width={32} height={32} />
    ) : (
      <img src={src} alt="Prosperofy" className={imgClass} width={180} height={32} />
    );
  /* eslint-enable @next/next/no-img-element */

  if (!linkToDashboard) {
    return <span className={className}>{img}</span>;
  }

  return (
    <Link
      href="/dashboard"
      aria-label="Go to dashboard"
      className={`inline-flex shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
    >
      {img}
    </Link>
  );
}
