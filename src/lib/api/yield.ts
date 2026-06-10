import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type {
  CreateYieldAllocationBody,
  YieldAllocation,
  YieldAllocationsListPayload,
  YieldEarningsListPayload,
  YieldOverview,
  YieldPool,
  YieldPoolsListPayload,
} from "@/lib/api/types";

export function getYieldOverview(token: string): Promise<YieldOverview> {
  return laravelFetch<YieldOverview>(API.app.yield.overview, { token });
}

export function getYieldPools(token: string): Promise<YieldPoolsListPayload> {
  return laravelFetch<YieldPoolsListPayload>(API.app.yield.pools, { token });
}

export function getYieldPool(token: string, poolId: string): Promise<YieldPool> {
  return laravelFetch<YieldPool>(API.app.yield.pool(poolId), { token });
}

export function getYieldAllocations(token: string): Promise<YieldAllocationsListPayload> {
  return laravelFetch<YieldAllocationsListPayload>(API.app.yield.allocations, { token });
}

export function getYieldAllocation(token: string, allocationId: string): Promise<YieldAllocation> {
  return laravelFetch<YieldAllocation>(API.app.yield.allocation(allocationId), { token });
}

export function createYieldAllocation(
  token: string,
  body: CreateYieldAllocationBody,
  idempotencyKey?: string,
): Promise<YieldAllocation> {
  return laravelFetch<YieldAllocation>(API.app.yield.allocations, {
    method: "POST",
    body,
    token,
    idempotencyKey,
  });
}

export function cancelYieldAllocation(token: string, allocationId: string): Promise<YieldAllocation> {
  return laravelFetch<YieldAllocation>(API.app.yield.cancelAllocation(allocationId), {
    method: "POST",
    token,
  });
}

export function toggleYieldAutoCompound(
  token: string,
  allocationId: string,
  enabled: boolean,
): Promise<YieldAllocation> {
  return laravelFetch<YieldAllocation>(API.app.yield.toggleAutoCompound(allocationId), {
    method: "POST",
    body: { enabled },
    token,
  });
}

export function getYieldEarnings(token: string): Promise<YieldEarningsListPayload> {
  return laravelFetch<YieldEarningsListPayload>(API.app.yield.earnings, { token });
}
