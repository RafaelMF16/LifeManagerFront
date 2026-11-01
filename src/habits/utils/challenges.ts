import type { ChallengeDto, ChallengeEffort, ChallengeType, RankingWeekPlaceDto } from '../types/ChallengeDtos'
import { formatAmount } from './habitProgress'

type Translate = (key: string, options?: Record<string, unknown>) => string

interface Measured {
  type: ChallengeType
  unit: string | null
}

/** How far along a challenge is, 0–100. */
export function challengePercent({ progress, target }: Pick<ChallengeDto, 'progress' | 'target'>) {
  if (target <= 0) return 0
  return Math.min(100, Math.round((progress / target) * 100))
}

export const challengeRemaining = ({ progress, target }: Pick<ChallengeDto, 'progress' | 'target'>) => Math.max(0, target - progress)

/** "5 days" for frequency, "10,000 ml" for volume. */
export function challengeAmount(value: number, challenge: Measured, translate: Translate, language: string) {
  if (challenge.type === 'Frequency') return translate('habits:challenges.amount.days', { count: value })
  return `${formatAmount(value, language)} ${challenge.unit ?? ''}`.trim()
}

/** "2 / 5 days" or "1,250 / 10,000 ml". */
export function challengeProgressLabel(challenge: ChallengeDto, translate: Translate, language: string) {
  if (challenge.type === 'Frequency') {
    return translate('habits:challenges.progress.days', { progress: challenge.progress, count: challenge.target })
  }
  return `${formatAmount(challenge.progress, language)} / ${challengeAmount(challenge.target, challenge, translate, language)}`
}

/**
 * The line under the bar: done, failed, or what is left against the days left ("2 more in 3 days", "≈ 500 ml a day").
 * A frequency that no longer fits in the days left says so plainly instead of asking the impossible.
 */
export function challengePace(challenge: ChallengeDto, translate: Translate, language: string) {
  if (challenge.status === 'Completed') return translate('habits:challenges.pace.completed')
  if (challenge.status === 'Failed') return translate('habits:challenges.pace.failed')

  const remaining = challengeRemaining(challenge)
  if (remaining === 0) return translate('habits:challenges.pace.reached')
  if (challenge.daysLeft === 0) return translate('habits:challenges.pace.over')

  if (challenge.type === 'Frequency') {
    if (remaining > challenge.daysLeft) return translate('habits:challenges.pace.outOfReach', { count: remaining })
    return translate('habits:challenges.pace.frequency', {
      count: remaining,
      days: translate('habits:challenges.amount.days', { count: challenge.daysLeft }),
    })
  }

  const perDay = Math.ceil(remaining / challenge.daysLeft)
  return translate('habits:challenges.pace.volume', {
    amount: challengeAmount(perDay, challenge, translate, language),
    count: challenge.daysLeft,
  })
}

export const effortKey = (effort: ChallengeEffort) => `habits:challenges.effort.${effort}`

/** "+60 coins · +120 XP". */
export const challengeReward = ({ rewardCoins, rewardXp }: { rewardCoins: number; rewardXp: number }, translate: Translate) =>
  translate('habits:challenges.reward', { coins: rewardCoins, xp: rewardXp })

/** A whole number typed with or without thousand separators ("10.000", "10 000"); null for anything else. */
export function parseWholeNumber(input: string): number | null {
  const digits = input.trim().replace(/[.\s ]/g, '')
  if (!/^\d+$/.test(digits)) return null
  const value = Number(digits)
  return Number.isSafeInteger(value) ? value : null
}

/** The past weeks' challenges grouped by week, keeping the backend's order (newest week first). */
export function groupByWeek(challenges: ChallengeDto[]): { weekStart: string; challenges: ChallengeDto[] }[] {
  const groups: { weekStart: string; challenges: ChallengeDto[] }[] = []
  for (const challenge of challenges) {
    const last = groups[groups.length - 1]
    if (last && last.weekStart === challenge.weekStart) last.challenges.push(challenge)
    else groups.push({ weekStart: challenge.weekStart, challenges: [challenge] })
  }
  return groups
}

/** A group's line in the weekly summary: "2º de 5 · 180 pts", with "· provisório" until the week closes. */
export function summaryPlace(place: RankingWeekPlaceDto, translate: Translate) {
  const line = translate('habits:moments.summary.place', { position: place.position, count: place.memberCount, points: place.points })
  return place.isFinal ? line : `${line} · ${translate('habits:moments.summary.provisional')}`
}
