# Wallet send confirm — manual QA checklist

Run against staging or production with `https://app.prosperofy.com` → Laravel API.

## Happy path

- [ ] Preview SOL send → confirm → lands on `/wallet/transactions/{id}`
- [ ] Transaction detail shows `pending`, then `broadcasted`, then `confirmed` (poll every ~5s)
- [ ] Wallet transaction list shows the new send

## Idempotency

- [ ] Double-click confirm quickly → only one pending/broadcasted tx; second response is duplicate
- [ ] After success, retry with same browser session without new preview → duplicate or consumed preview (no second on-chain send)

## Errors (confirm modal)

- [ ] **504 / gateway timeout**: toast says to check wallet history; no automatic retry
- [ ] **503 / RPC unavailable**: “Blockchain network is temporarily unavailable”
- [ ] **401**: “Session expired. Please sign in again.”
- [ ] **422 validation**: field-level message in toast
- [ ] Client abort (~30s): timeout copy mentions wallet history

## CORS (browser devtools)

- [ ] `POST /api/app/wallet/send/confirm` response includes `Access-Control-Allow-Origin: https://app.prosperofy.com`
- [ ] Preflight `OPTIONS` succeeds with `Idempotency-Key` in allowed headers

## Infrastructure

- [ ] DO `queue` worker processes `wallet-send` queue
- [ ] Web app `QUEUE_CONNECTION=database` (jobs not run inline on web)
