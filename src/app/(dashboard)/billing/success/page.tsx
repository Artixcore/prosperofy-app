"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { LoadingState } from "@/components/system/loading-state";

export default function BillingSuccessRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams.toString();
    router.replace(`/settings/billing/success${qs ? `?${qs}` : ""}`);
  }, [router, searchParams]);

  return <LoadingState label="Redirecting…" />;
}
