import type { IconName } from '../../shared/components/Icon/Icon'
import type { GameItemDto, GameItemKind } from '../types/GameItemDtos'
import type { PlayerProfileDto } from '../types/PlayerProfileDtos'

type Translate = (key: string, options?: Record<string, unknown>) => string

const ITEM_ICONS: Record<GameItemKind, IconName> = {
  HpPotion: 'heart',
  StreakFreeze: 'snowflake',
}

export function gameItemIcon(kind: GameItemKind): IconName {
  return ITEM_ICONS[kind]
}

/** "Poção de HP" / "HP potion". */
export function gameItemName(kind: GameItemKind, translate: Translate) {
  return translate(`habits:shop.items.names.${kind}`)
}

/** What the item does: "+25 HP" or "+1 streak freeze". */
export function gameItemEffect(item: GameItemDto, translate: Translate) {
  return item.hpRestore !== null
    ? translate('habits:shop.items.effects.hp', { count: item.hpRestore })
    : translate('habits:shop.items.effects.freeze')
}

/** "1 of 3 today" / "0 of 1 this week". */
export function gameItemUsage(item: GameItemDto, translate: Translate) {
  return translate(`habits:shop.items.usage.${item.limitPeriod}`, { used: item.purchasedInPeriod, limit: item.limit })
}

/**
 * Why the item can't be bought now, in the backend's order (limit → effect → coins), or null when it can. The limit and
 * the effect come from the backend's answer; the coins from the outlet context's profile when there is one, since it
 * is reloaded after every game action and may be newer.
 */
export function gameItemBlockedReason(item: GameItemDto, profile: PlayerProfileDto | undefined, translate: Translate) {
  switch (item.availability) {
    case 'LimitReached':
      return translate(`habits:shop.items.blocked.limit${item.limitPeriod}`)
    case 'HpFull':
      return translate('habits:shop.items.blocked.hpFull')
    case 'StreakFreezesFull':
      return translate('habits:shop.items.blocked.freezesFull', { max: profile?.maxStreakFreezes ?? 2 })
  }

  const coins = profile?.coins
  const missing = coins === undefined ? (item.availability === 'InsufficientCoins' ? item.price : 0) : item.price - coins
  return missing > 0 ? translate('habits:shop.list.missing', { count: missing }) : null
}

/** HP the potion would heal now: its restore, capped by what's missing to the maximum. */
export function hpHealedNow(item: GameItemDto, profile: PlayerProfileDto | undefined) {
  if (item.hpRestore === null) return 0
  if (!profile) return item.hpRestore
  return Math.max(Math.min(item.hpRestore, profile.maxHp - profile.hp), 0)
}
