const NICE_STEPS = [1, 2, 2.5, 5, 10]

/**
 * The smallest "round" number (1, 2, 2.5 or 5 × 10ⁿ) at or above `value`, so a chart's top gridline lands on
 * a clean figure (R$ 5 mil rather than R$ 4.317). Zero or less gives 1, so an empty chart still has a scale.
 */
export function niceMax(value: number): number {
  if (!(value > 0)) return 1

  const magnitude = 10 ** Math.floor(Math.log10(value))
  const step = NICE_STEPS.find((candidate) => candidate * magnitude >= value) ?? 10

  return step * magnitude
}

/** `value` as a 0–1 share of `max`, clamped, for a bar's length. */
export function barRatio(value: number, max: number): number {
  if (!(max > 0)) return 0
  return Math.min(Math.max(value / max, 0), 1)
}
