/** How full a bar is, from 0 to 1. A non-positive `max` (no data yet) reads as empty. */
export function progressRatio(value: number, max: number): number {
  if (!(max > 0) || !Number.isFinite(value)) return 0

  return Math.min(Math.max(value / max, 0), 1)
}
