import type { ReactNode } from "react";

type SafeChartContainerProps = {
  children: ReactNode;
  size?: "small" | "large";
};

export function SafeChartContainer({ children, size = "large" }: SafeChartContainerProps) {
  const sizeClass = size === "small" ? "h-40 min-h-[160px]" : "h-64 min-h-[240px]";
  return (
    <div className="min-w-0">
      <div className={`w-full min-w-0 ${sizeClass}`}>{children}</div>
    </div>
  );
}
