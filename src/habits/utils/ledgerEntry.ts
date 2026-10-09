import type { IconName } from '../../shared/components/Icon/Icon'
import type { GameLedgerEntryDto, GameLedgerEntryKind } from '../types/LedgerDtos'

type Translate = (key: string, options?: Record<string, unknown>) => string

export type LedgerDeltaKind = 'coins' | 'xp' | 'hp'

export interface LedgerDelta {
  kind: LedgerDeltaKind
  value: number
}

const KIND_ICONS: Record<GameLedgerEntryKind, IconName> = {
  HabitDone: 'check',
  HabitMissed: 'x',
  Relapse: 'x',
  CleanDay: 'sparkles',
  StreakMilestone: 'flame',
  RewardRedeemed: 'gift',
  Knockout: 'heart',
  Undo: 'undo-2',
  FreezeUsed: 'snowflake',
  LevelUp: 'sparkles',
}

export function ledgerIcon(entry: GameLedgerEntryDto): IconName {
  return KIND_ICONS[entry.kind]
}

/**
 * What the line is about: the kind ("Habit done", "Redeemed") and, when the entry has one, the habit or reward name it
 * copied ("Habit done · Read"). An undo says whether it undid a reward or a habit's day.
 */
export function ledgerTitle(entry: GameLedgerEntryDto, translate: Translate) {
  const kindKey = entry.kind === 'Undo' && entry.rewardId !== null ? 'UndoRedemption' : entry.kind
  const kind = translate(`habits:history.kinds.${kindKey}`)
  return entry.description ? `${kind} · ${entry.description}` : kind
}

/** The changes the entry made, coins first, leaving out what didn't move. */
export function ledgerDeltas(entry: GameLedgerEntryDto): LedgerDelta[] {
  const deltas: LedgerDelta[] = [
    { kind: 'coins', value: entry.coinsDelta },
    { kind: 'xp', value: entry.xpDelta },
    { kind: 'hp', value: entry.hpDelta },
  ]
  return deltas.filter((delta) => delta.value !== 0)
}

/** "+10" / "−8" with a real minus sign. */
export function signedValue(value: number) {
  return value > 0 ? `+${value}` : `−${Math.abs(value)}`
}
