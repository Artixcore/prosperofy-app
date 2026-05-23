"use client";

import { useQuery } from "@tanstack/react-query";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import { ApiClientError } from "@/lib/api/errors";
import { useAuth } from "@/lib/auth/session-context";
import type { NewsSearchResult } from "@/types/news";

function assertToken(token: string | null): string {
  if (token) return token;
  throw new ApiClientError("Please sign in again.", {
    status: 401,
    code: "UNAUTHENTICATED",
    retryable: false,
  });
}

function buildQs(params: Record<string, string | number | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") sp.set(k, String(v));
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

function newsEnabled(
  authReady: boolean,
  isAuthenticated: boolean,
  token: string | null,
  extra = true,
): boolean {
  return Boolean(authReady && isAuthenticated && token && extra);
}

export function useNewsLatestQuery(q?: string, enabled = true) {
  const { token, authReady, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["news-latest", q],
    queryFn: () =>
      laravelFetch<NewsSearchResult>(`${API.app.news.latest}${buildQs({ q, limit: 8 })}`, {
        token: assertToken(token),
      }),
    staleTime: 5 * 60_000,
    retry: false,
    enabled: newsEnabled(authReady, isAuthenticated, token, enabled && Boolean(q?.trim())),
  });
}

export function useNewsCryptoQuery(q?: string, enabled = true) {
  const { token, authReady, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["news-crypto", q],
    queryFn: () =>
      laravelFetch<NewsSearchResult>(`${API.app.news.crypto}${buildQs({ q: q ?? "bitcoin", limit: 8 })}`, {
        token: assertToken(token),
      }),
    staleTime: 5 * 60_000,
    retry: false,
    enabled: newsEnabled(authReady, isAuthenticated, token, enabled),
  });
}

export function useNewsMarketQuery(q?: string, enabled = true) {
  const { token, authReady, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["news-market", q],
    queryFn: () =>
      laravelFetch<NewsSearchResult>(
        `${API.app.news.market}${buildQs({ q: q ?? "stock market", limit: 8 })}`,
        { token: assertToken(token) },
      ),
    staleTime: 5 * 60_000,
    retry: false,
    enabled: newsEnabled(authReady, isAuthenticated, token, enabled),
  });
}

export function useNewsSearchQuery(q: string, enabled = true) {
  const { token, authReady, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["news-search", q],
    queryFn: () =>
      laravelFetch<NewsSearchResult>(`${API.app.news.search}${buildQs({ q, limit: 12 })}`, {
        token: assertToken(token),
      }),
    staleTime: 5 * 60_000,
    retry: false,
    enabled: newsEnabled(authReady, isAuthenticated, token, enabled && q.trim().length >= 2),
  });
}
