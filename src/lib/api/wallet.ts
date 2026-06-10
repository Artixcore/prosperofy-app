import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type {
  WalletBalanceRefreshPayload,
  WalletControlCenterPayload,
} from "@/lib/api/types";

export function getWalletControlCenter(token: string): Promise<WalletControlCenterPayload> {
  return laravelFetch<WalletControlCenterPayload>(API.app.wallet.controlCenter, { token });
}

export function refreshWalletBalances(
  token: string,
  options?: { force?: boolean },
): Promise<WalletBalanceRefreshPayload> {
  return laravelFetch<WalletBalanceRefreshPayload>(API.app.wallet.balanceRefresh, {
    method: "POST",
    body: { force: options?.force ?? true },
    token,
  });
}
