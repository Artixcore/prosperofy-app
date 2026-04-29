"use client";

import { useQuery } from "@tanstack/react-query";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type { VirtualCard } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/session-context";

type CardsPayload = { items: VirtualCard[] };

export function useV1VirtualCardsQuery() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["v1-virtual-cards", token],
    queryFn: () => laravelFetch<CardsPayload>(API.v1.virtualCards.list, { token }),
    enabled: Boolean(token),
  });
}
