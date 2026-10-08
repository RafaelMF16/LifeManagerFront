/**
 * How many days of habits a reward costs at the player's recent pace, rounded up ("≈ 3 days of habits"); null with no
 * recent earnings, when there is nothing to estimate from.
 */
export function daysOfHabits(cost: number, averageDailyCoins: number | undefined): number | null {
  if (!averageDailyCoins || averageDailyCoins <= 0) return null
  return Math.max(1, Math.ceil(cost / averageDailyCoins))
}

/** Coins still missing to afford `cost`; 0 when the balance covers it (or isn't known yet). */
export function coinsMissing(cost: number, coins: number | undefined): number {
  if (coins === undefined) return 0
  return Math.max(cost - coins, 0)
}
