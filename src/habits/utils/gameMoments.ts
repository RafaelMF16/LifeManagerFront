import type { LastKnockoutDto, PlayerProfileDto } from '../types/PlayerProfileDtos'

const SEEN_KNOCKOUT_KEY = 'lm-habits-seen-knockout'
const SEEN_LEVEL_KEY = 'lm-habits-seen-level'

/** A moment worth stopping the player for: shown once, then marked as seen on this device. */
export type GameMoment = { kind: 'knockout'; knockout: LastKnockoutDto } | { kind: 'levelUp'; level: number }

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
 * caused it), then a level reached since the last one they saw. Null when there is nothing new.
 */
export function pendingMoment(profile: PlayerProfileDto, seenKnockout: number | null, seenLevel: number | null): GameMoment | null {
  const knockout = profile.lastKnockout
  if (knockout && knockout.id > (seenKnockout ?? 0)) return { kind: 'knockout', knockout }
  if (seenLevel !== null && profile.level > seenLevel) return { kind: 'levelUp', level: profile.level }
  return null
}
