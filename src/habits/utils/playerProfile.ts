import type { AchievementCode, AchievementDto, AchievementTier } from '../types/AchievementDtos'
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
