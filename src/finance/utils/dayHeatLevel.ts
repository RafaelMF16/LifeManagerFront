/** How strong a calendar day's color is: 0 (nothing spent) to 4 (the month's biggest days). */
export type DayHeatLevel = 0 | 1 | 2 | 3 | 4

const HEAT_LEVELS = 4

/** The quarter of the month's biggest day this day falls in: (0, 25%] → 1 … (75%, 100%] → 4. */
export function dayHeatLevel(total: number, maxDayTotal: number): DayHeatLevel {
  if (total <= 0 || maxDayTotal <= 0) return 0
  return Math.min(HEAT_LEVELS, Math.ceil((HEAT_LEVELS * total) / maxDayTotal)) as DayHeatLevel
}
