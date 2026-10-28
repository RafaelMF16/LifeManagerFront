import type { AchievementCode, AchievementDto } from '../types/AchievementDtos'
import { isUnlocked } from './achievements'

/** The titles the player can pick: those of the unlocked achievements, in catalog order. */
export function unlockedTitles(achievements: AchievementDto[]): AchievementCode[] {
  return achievements.filter(isUnlocked).map((achievement) => achievement.code)
}

/** "outubro de 2026" from the first ledger day (`yyyy-MM-dd`, a calendar day: formatted in UTC so it never shifts). */
export function formatPlayingSince(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`))
}
