import type { UserAgentRecord } from "@/lib/api/types";

export type NormalizedAgentList = {
  items: UserAgentRecord[];
  pagination: {
    currentPage: number;
    perPage: number;
    total: number;
    lastPage: number;
  };
};

type AgentListEnvelopeData = {
  items?: unknown;
  pagination?: Record<string, unknown>;
  data?: unknown;
  meta?: Record<string, unknown>;
};

const DEFAULT_PAGINATION: NormalizedAgentList["pagination"] = {
  currentPage: 1,
  perPage: 20,
  total: 0,
  lastPage: 1,
};

function toPositiveInt(value: unknown, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return Math.floor(parsed);
}

function normalizePagination(
  pagination?: Record<string, unknown> | null,
  fallbackPerPage = 20,
): NormalizedAgentList["pagination"] {
  if (!pagination || typeof pagination !== "object") {
    return { ...DEFAULT_PAGINATION, perPage: fallbackPerPage };
  }

  const currentPage = toPositiveInt(pagination.current_page ?? pagination.currentPage, 1);
  const perPage = toPositiveInt(pagination.per_page ?? pagination.perPage, fallbackPerPage);
  const total = toPositiveInt(pagination.total, 0);
  const lastPage = toPositiveInt(pagination.last_page ?? pagination.lastPage, Math.max(1, currentPage));

  return {
    currentPage: Math.max(1, currentPage),
    perPage: Math.max(1, perPage),
    total,
    lastPage: Math.max(1, lastPage),
  };
}

function asAgentItems(value: unknown): UserAgentRecord[] {
  if (!Array.isArray(value)) return [];
  return value as UserAgentRecord[];
}

/**
 * Normalizes agent list envelope data for both current and legacy backend shapes.
 */
export function normalizeAgentListResponse(
  raw: AgentListEnvelopeData | null | undefined,
  fallbackPerPage = 20,
): NormalizedAgentList {
  if (!raw || typeof raw !== "object") {
    return { items: [], pagination: { ...DEFAULT_PAGINATION, perPage: fallbackPerPage } };
  }

  if (Array.isArray(raw.items)) {
    return {
      items: asAgentItems(raw.items),
      pagination: normalizePagination(raw.pagination, fallbackPerPage),
    };
  }

  if (Array.isArray(raw.data)) {
    return {
      items: asAgentItems(raw.data),
      pagination: normalizePagination(raw.meta, fallbackPerPage),
    };
  }

  return { items: [], pagination: { ...DEFAULT_PAGINATION, perPage: fallbackPerPage } };
}
