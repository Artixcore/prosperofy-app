"use client";

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { useToast } from "@/components/system/toast-context";
import { showComingSoonToast } from "@/features/wallets/coming-soon-action-handler";
import type { SubWalletAction } from "@/lib/api/types";

type ToastFn = ReturnType<typeof useToast>["pushToast"];

export function handleSubWalletAction(
  action: SubWalletAction,
  router: AppRouterInstance,
  pushToast: ToastFn,
): void {
  if (!action.enabled) {
    showComingSoonToast(pushToast, action.reason);
    return;
  }

  switch (action.key) {
    case "add_funds":
      router.push("/wallet/receive");
      return;
    case "view_ai_suggestions":
      router.push("/agent");
      return;
    case "view_spending":
      router.push("/wallet/transactions");
      return;
    case "top_up_card":
      router.push("/card");
      return;
    case "explore_yield":
      if (typeof document !== "undefined") {
        document.getElementById("yield-pools")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    default:
      showComingSoonToast(pushToast, action.reason);
  }
}
