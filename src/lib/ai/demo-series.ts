/** Deterministic synthetic OHLC for forms (length n, values in a realistic range). */
export function demoOhlcv(n: number): {
  open: number[];
  high: number[];
  low: number[];
  close: number[];
  volume: number[];
} {
  const open: number[] = [];
  const high: number[] = [];
  const low: number[] = [];
  const close: number[] = [];
  const volume: number[] = [];
  let px = 100;
  for (let i = 0; i < n; i += 1) {
    const drift = Math.sin(i / 7) * 0.4 + (i % 5) * 0.02;
    const o = px;
    const c = px + drift;
    const hi = Math.max(o, c) + Math.random() * 0.35;
    const lo = Math.min(o, c) - Math.random() * 0.35;
    open.push(Number(o.toFixed(4)));
    high.push(Number(hi.toFixed(4)));
    low.push(Number(lo.toFixed(4)));
    close.push(Number(c.toFixed(4)));
    volume.push(Math.round(1000 + Math.random() * 500));
    px = c;
  }
  return { open, high, low, close, volume };
}
