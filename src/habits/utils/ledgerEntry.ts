import type { IconName } from '../../shared/components/Icon/Icon'
import type { GameLedgerEntryDto, GameLedgerEntryKind } from '../types/LedgerDtos'
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
}

/** A purchase shows its item's icon; every other line, its kind's. */
export function ledgerIcon(entry: GameLedgerEntryDto): IconName {
  if (entry.kind === 'ItemPurchased' && entry.itemKind) return gameItemIcon(entry.itemKind)
  return KIND_ICONS[entry.kind]
}

/**
 * What the line is about: the kind ("Habit done", "Redeemed") and, when the entry has one, the habit or reward name it
 * copied ("Habit done · Read") or the game item, named in the UI language ("Item bought · HP potion"). An undo says
 * whether it undid a reward, an item purchase or a habit's day.
 */
export function ledgerTitle(entry: GameLedgerEntryDto, translate: Translate) {
  const kind = translate(`habits:history.kinds.${titleKindKey(entry)}`)
  const about = entry.itemKind && entry.kind !== 'LevelUp' && entry.kind !== 'Knockout' ? gameItemName(entry.itemKind, translate) : entry.description
  return about ? `${kind} · ${about}` : kind
}

function titleKindKey(entry: GameLedgerEntryDto) {
  if (entry.kind !== 'Undo') return entry.kind
  if (entry.rewardId !== null) return 'UndoRedemption'
  if (entry.itemKind !== null) return 'UndoItemPurchase'
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
