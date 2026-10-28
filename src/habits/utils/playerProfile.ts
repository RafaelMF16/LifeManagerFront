import type { AchievementCode, AchievementDto, AchievementTier } from '../types/AchievementDtos'
import type { EvolutionPointDto } from '../types/PlayerProfileDtos'
import { isUnlocked } from './achievements'

/** The titles the player can pick: those of the unlocked achievements, in catalog order. */
export function unlockedTitles(achievements: AchievementDto[]): AchievementCode[] {
  return achievements.filter(isUnlocked).map((achievement) => achievement.code)
}

/** "outubro de 2026" from the first ledger day (`yyyy-MM-dd`, a calendar day: formatted in UTC so it never shifts). */
export function formatPlayingSince(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`))
}

const TIER_RANK: Record<AchievementTier, number> = { Gold: 0, Silver: 1, Bronze: 2 }

/** How many achievements the profile's showcase holds. */
export const SHOWCASE_SIZE = 6

/** The profile's showcase: the best unlocked achievements, gold first, and inside a tier the latest first. */
export function showcase(achievements: readonly AchievementDto[], limit = SHOWCASE_SIZE): AchievementDto[] {
  return achievements
    .filter(isUnlocked)
    .toSorted((a, b) => TIER_RANK[a.tier] - TIER_RANK[b.tier] || b.unlockedAt!.localeCompare(a.unlockedAt!))
    .slice(0, limit)
}

/** The evolution chart shows one of these at a time: they have different scales, and one axis is the rule. */
export type EvolutionSeries = 'xp' | 'coins'

export const evolutionValue = (point: EvolutionPointDto, series: EvolutionSeries) => (series === 'xp' ? point.totalXp : point.coins)

/** Where the period started and ended, and the change between them. */
export function periodSummary(points: readonly EvolutionPointDto[], series: EvolutionSeries) {
  const start = points.length > 0 ? evolutionValue(points[0], series) : 0
  const end = points.length > 0 ? evolutionValue(points[points.length - 1], series) : 0
  return { start, end, change: end - start }
}

/** A change for the UI language with its sign: "+340", "−30" (a real minus), "0". */
export function signedNumber(value: number, format: Intl.NumberFormat) {
  const digits = format.format(Math.abs(value))
  if (value > 0) return `+${digits}`
  if (value < 0) return `−${digits}`
  return digits
}

/** Nothing ever moved: a new player, whose chart is a flat line at 0. */
export const isEmptyEvolution = (points: readonly EvolutionPointDto[]) =>
  points.every((point) => point.totalXp === 0 && point.coins === 0)

/**
 * One point a week for the screen-reader table, counted back from today so today is always in, oldest first. The
 * first day is added when it isn't a week's step, so the table also starts where the chart does.
 */
export function weeklyPoints(points: readonly EvolutionPointDto[]): EvolutionPointDto[] {
  const weekly = points.filter((_, index) => (points.length - 1 - index) % 7 === 0)
  return points.length > 0 && weekly[0] !== points[0] ? [points[0], ...weekly] : weekly
}

/** The point under a pointer at `x` of a plot `width` wide holding `count` evenly spread points. */
export function nearestPointIndex(x: number, width: number, count: number) {
  if (count <= 1 || !(width > 0)) return 0
  return Math.min(Math.max(Math.round((x / width) * (count - 1)), 0), count - 1)
}
