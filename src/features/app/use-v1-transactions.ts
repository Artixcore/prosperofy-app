"use client";

import { useQuery } from "@tanstack/react-query";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type { AppListResponse, TransactionRecord } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/session-context";

export function useV1TransactionsQuery() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["v1-transactions", token],
    queryFn: () =>
      laravelFetch<AppListResponse<TransactionRecord>>(`${API.v1.transactions.list}?per_page=8`, {
        token,
      }),
    enabled: Boolean(token),
  });
}
