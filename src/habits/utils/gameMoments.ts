import type { NewAchievementDto } from '../types/AchievementDtos'
import type { ChallengeDto, WeeklySummaryDto } from '../types/ChallengeDtos'
import type { LastKnockoutDto, PlayerProfileDto } from '../types/PlayerProfileDtos'

const SEEN_KNOCKOUT_KEY = 'lm-habits-seen-knockout'
const SEEN_LEVEL_KEY = 'lm-habits-seen-level'

/**
 * A moment worth stopping the player for, shown once: a knockout or a level is marked as seen on this device, new
 * achievements, completed challenges and the weekly summary on the backend (any device).
 */
export type GameMoment =
  | { kind: 'knockout'; knockout: LastKnockoutDto }
  | { kind: 'achievements'; achievements: NewAchievementDto[] }
  | { kind: 'challenges'; challenges: ChallengeDto[] }
  | { kind: 'summary'; summary: WeeklySummaryDto }
  | { kind: 'levelUp'; level: number }

/** Names a set of unlocks, so the layout can tell the ones it already closed (and is marking as seen) from new ones. */
export const achievementsKey = (achievements: readonly NewAchievementDto[]) => achievements.map((achievement) => achievement.code).join(',')

/** Same as {@link achievementsKey}, for a set of completed challenges. */
export const challengesKey = (challenges: readonly ChallengeDto[]) => challenges.map((challenge) => challenge.id).join(',')

function readNumber(key: string): number | null {
  try {
    const value = localStorage.getItem(key)
    if (value === null) return null
    const parsed = Number(value)
    return Number.isInteger(parsed) ? parsed : null
  } catch {
    return null
  }
}

function writeNumber(key: string, value: number) {
  try {
    localStorage.setItem(key, String(value))
  } catch {
    // Without storage the moment just shows again next time.
  }
}

/** The ledger id of the last knockout the player saw, or null. Storage can be unavailable. */
export const readSeenKnockout = () => readNumber(SEEN_KNOCKOUT_KEY)
export const writeSeenKnockout = (id: number) => writeNumber(SEEN_KNOCKOUT_KEY, id)

/** The level the player last saw, or null on a device that never showed the habits. */
export const readSeenLevel = () => readNumber(SEEN_LEVEL_KEY)
export const writeSeenLevel = (level: number) => writeNumber(SEEN_LEVEL_KEY, level)

/**
 * The level to remember as seen without celebrating: the current one on a device that never saw any (a first visit or
 * a new device shouldn't celebrate every level so far), or after the level went down (XP taken back by an undo).
 * Null when the stored one is still right.
 */
export function levelBaseline(level: number, seenLevel: number | null): number | null {
  if (seenLevel === null || level < seenLevel) return level
  return null
}

/**
 * What to show the player now, most important first: a knockout they haven't seen (whether a check-in or the day close
 * caused it), then the achievements they haven't been shown (unless the layout just closed that same set), then the
 * challenges completed since they last looked (same rule), then last week's summary (the layout fetches it, null when
 * there is none to show), then a level reached since the last one they saw (often one an achievement's bonus or a
 * challenge's reward paid for). Null when there is nothing new.
 */
export function pendingMoment(
  profile: PlayerProfileDto,
  seenKnockout: number | null,
  seenLevel: number | null,
  closedAchievements: string | null = null,
  closedChallenges: string | null = null,
  summary: WeeklySummaryDto | null = null,
): GameMoment | null {
  const knockout = profile.lastKnockout
  if (knockout && knockout.id > (seenKnockout ?? 0)) return { kind: 'knockout', knockout }
  const achievements = profile.newAchievements ?? []
  if (achievements.length > 0 && achievementsKey(achievements) !== closedAchievements) return { kind: 'achievements', achievements }
  const challenges = profile.newChallenges ?? []
  if (challenges.length > 0 && challengesKey(challenges) !== closedChallenges) return { kind: 'challenges', challenges }
  if (summary) return { kind: 'summary', summary }
  if (seenLevel !== null && profile.level > seenLevel) return { kind: 'levelUp', level: profile.level }
  return null
}

/** How a week's figure compares with the week before: "+3", "−2" or "=". */
export function summaryChange(current: number, previous: number) {
  const change = current - previous
  if (change === 0) return '='
  return change > 0 ? `+${change}` : `−${-change}`
}
