"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiClientError } from "@/lib/api/errors";
import {
  createYieldAllocation,
  getYieldAllocations,
  getYieldEarnings,
  getYieldOverview,
  getYieldPools,
} from "@/lib/api/yield";
import type { CreateYieldAllocationBody } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/session-context";

function assertToken(token: string | null): string {
  if (token) return token;
  throw new ApiClientError("Please sign in again.", {
    status: 401,
    code: "UNAUTHENTICATED",
    retryable: false,
  });
}

export function useYieldOverviewQuery() {
  const { token, authReady, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["yield-overview", token],
    queryFn: () => getYieldOverview(assertToken(token)),
    enabled: Boolean(authReady && isAuthenticated && token),
    staleTime: 15_000,
    retry: false,
  });
}

export function useYieldPoolsQuery() {
  const { token, authReady, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["yield-pools", token],
    queryFn: () => getYieldPools(assertToken(token)),
    enabled: Boolean(authReady && isAuthenticated && token),
    staleTime: 15_000,
    retry: false,
  });
}

export function useYieldAllocationsQuery() {
  const { token, authReady, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["yield-allocations", token],
    queryFn: () => getYieldAllocations(assertToken(token)),
    enabled: Boolean(authReady && isAuthenticated && token),
    staleTime: 15_000,
    retry: false,
  });
}

export function useYieldEarningsQuery() {
  const { token, authReady, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["yield-earnings", token],
    queryFn: () => getYieldEarnings(assertToken(token)),
    enabled: Boolean(authReady && isAuthenticated && token),
    staleTime: 15_000,
    retry: false,
  });
}

export function useCreateYieldAllocationMutation() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateYieldAllocationBody) => {
      const idempotencyKey =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      return createYieldAllocation(assertToken(token), body, idempotencyKey);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["yield-overview"] }),
        queryClient.invalidateQueries({ queryKey: ["yield-allocations"] }),
        queryClient.invalidateQueries({ queryKey: ["wallet-control-center"] }),
      ]);
    },
    retry: false,
  });
}
