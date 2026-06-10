import type { useToast } from "@/components/system/toast-context";

type ToastFn = ReturnType<typeof useToast>["pushToast"];

export function showComingSoonToast(pushToast: ToastFn, reason?: string): void {
  pushToast({
    tone: "info",
    title: "This feature is coming soon.",
    description: reason && reason !== "Coming soon" ? reason : undefined,
  });
}
