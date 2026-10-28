import type { IconName } from '../../shared/components/Icon/Icon'
import type { GameLedgerEntryDto, GameLedgerEntryKind } from '../types/LedgerDtos'
import { achievementName } from './achievements'
import { gameItemIcon, gameItemName } from './gameItems'

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
  ItemPurchased: 'store',
  AchievementUnlocked: 'trophy',
}

/** A purchase shows its item's icon; every other line, its kind's. */
export function ledgerIcon(entry: GameLedgerEntryDto): IconName {
  if (entry.kind === 'ItemPurchased' && entry.itemKind) return gameItemIcon(entry.itemKind)
  return KIND_ICONS[entry.kind]
}

/**
 * What the line is about: the kind ("Habit done", "Redeemed") and, when the entry has one, the habit or reward name it
 * copied ("Habit done · Read") or the game item or achievement, named in the UI language ("Item bought · HP potion",
 * "Achievement · Consistency"). An undo says
 * whether it undid a reward, an item purchase or a habit's day.
 */
export function ledgerTitle(entry: GameLedgerEntryDto, translate: Translate) {
  const kind = translate(`habits:history.kinds.${titleKindKey(entry)}`)
  const about = ledgerAbout(entry, translate)
  return about ? `${kind} · ${about}` : kind
}

/** The game item of a purchase or its undo, or the achievement of an unlock bonus, in the UI language; else the copied name. */
function ledgerAbout(entry: GameLedgerEntryDto, translate: Translate) {
  if (entry.kind === 'LevelUp' || entry.kind === 'Knockout') return entry.description
  if (entry.itemKind) return gameItemName(entry.itemKind, translate)
  if (entry.achievementCode) return achievementName(entry.achievementCode, translate)
  return entry.description
}

function titleKindKey(entry: GameLedgerEntryDto) {
  if (entry.kind !== 'Undo') return entry.kind
  if (entry.rewardId !== null) return 'UndoRedemption'
  if (entry.itemKind) return 'UndoItemPurchase'
  return entry.kind
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
