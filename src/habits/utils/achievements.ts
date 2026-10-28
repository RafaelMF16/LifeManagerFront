import type { IconName } from '../../shared/components/Icon/Icon'
import type { AchievementCode, AchievementDto, AchievementFamily, AchievementTier } from '../types/AchievementDtos'

type Translate = (key: string, options?: Record<string, unknown>) => string

const FAMILY_ICONS: Record<AchievementFamily, IconName> = {
  CheckIns: 'check',
  Streak: 'flame',
  Level: 'sparkles',
  Redemptions: 'gift',
  CleanDays: 'sparkles',
  Overcoming: 'trophy',
}

export const achievementFamilyIcon = (family: AchievementFamily): IconName => FAMILY_ICONS[family]

export const achievementName = (code: AchievementCode, translate: Translate) => translate(`habits:achievements.names.${code}`)

/** The title the achievement unlocks, which the player can show on their profile. */
export const achievementTitle = (code: AchievementCode, translate: Translate) => translate(`habits:achievements.titles.${code}`)

export const achievementTierName = (tier: AchievementTier, translate: Translate) => translate(`habits:achievements.tiers.${tier}`)

export const isUnlocked = (achievement: AchievementDto) => achievement.unlockedAt !== null

/**
 * The family's tiers share one number, so its texts are keyed by family; the two one-off feats of `Overcoming` count
 * different things, so theirs are keyed by code.
 */
function criterionKey(achievement: Pick<AchievementDto, 'code' | 'family'>) {
  return achievement.family === 'Overcoming' ? achievement.code : achievement.family
}

/** What it takes: "100 check-ins", "Reach level 5". */
export function achievementCriterion(achievement: AchievementDto, translate: Translate) {
  return translate(`habits:achievements.criteria.${criterionKey(achievement)}`, { count: achievement.threshold })
}

/** What is still missing: "3 check-ins to go". */
export function achievementRemaining(achievement: AchievementDto, translate: Translate) {
  const count = Math.max(achievement.threshold - achievement.progress, 0)
  return translate(`habits:achievements.remaining.${criterionKey(achievement)}`, { count })
}

/** "37 / 100". */
export const achievementProgressLabel = (achievement: AchievementDto) => `${achievement.progress} / ${achievement.threshold}`

/** 0 to 100, for the progress bar. */
export function achievementPercent(achievement: AchievementDto) {
  if (achievement.threshold <= 0) return 100
  return Math.min(Math.round((achievement.progress / achievement.threshold) * 100), 100)
}

/** "+100 coins · +150 XP". */
export function achievementBonus(bonus: { coinsBonus: number; xpBonus: number }, translate: Translate) {
  return [
    translate('habits:achievements.bonus.coins', { count: bonus.coinsBonus }),
    translate('habits:achievements.bonus.xp', { value: bonus.xpBonus }),
  ].join(' · ')
}

/** The unlock day, "28 Oct 2026", in `locale`. */
export function formatUnlockedAt(unlockedAt: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(unlockedAt))
}

export interface AchievementGroup {
  family: AchievementFamily
  achievements: AchievementDto[]
}

/** The catalog split by family, keeping the catalog's order (bronze first inside each one). */
export function groupAchievementsByFamily(achievements: readonly AchievementDto[]): AchievementGroup[] {
  const groups: AchievementGroup[] = []
  for (const achievement of achievements) {
    const group = groups.find((existing) => existing.family === achievement.family)
    if (group) group.achievements.push(achievement)
    else groups.push({ family: achievement.family, achievements: [achievement] })
  }
  return groups
}

/**
 * The next goals, for "Almost there": each family's lowest locked tier (the two feats of `Overcoming` each count on
 * their own), the ones furthest along first, ties in catalog order. Empty once everything is unlocked.
 */
export function nearestAchievements(achievements: readonly AchievementDto[], limit = 3): AchievementDto[] {
  const nextGoals: AchievementDto[] = []
  const seen = new Set<string>()
  for (const achievement of achievements) {
    if (isUnlocked(achievement)) continue
    const key = criterionKey(achievement)
    if (seen.has(key)) continue
    seen.add(key)
    nextGoals.push(achievement)
  }

  return nextGoals
    .map((achievement, index) => ({ achievement, index, ratio: achievement.progress / achievement.threshold }))
    .sort((a, b) => b.ratio - a.ratio || a.index - b.index)
    .slice(0, limit)
    .map(({ achievement }) => achievement)
}
