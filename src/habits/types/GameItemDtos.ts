import type { WalletChangeDto } from './HabitTodayDtos'

// Espelha LifeManager.Domain/GameItems/Enums (binds by name).
export type GameItemKind = 'HpPotion' | 'StreakFreeze'
export type GameItemLimitPeriod = 'Day' | 'Week'
export type GameItemAvailability = 'Available' | 'LimitReached' | 'HpFull' | 'StreakFreezesFull' | 'InsufficientCoins'

// Espelha LifeManager.Application/GameItems/DTOs
/** One shop item and where the player stands with it. */
export interface GameItemDto {
  kind: GameItemKind
  price: number
  /** HP it heals at most; null for items that don't heal. */
  hpRestore: number | null
  limit: number
  limitPeriod: GameItemLimitPeriod
  /** Purchases not undone in the current day or week. */
  purchasedInPeriod: number
  /** A hint from the backend's state when it answered; the purchase checks everything again. */
  availability: GameItemAvailability
}

/** One item purchase, with the price paid and the HP actually healed. */
export interface GameItemPurchaseDto {
  id: number
  kind: GameItemKind
  costPaid: number
  /** 0 for items that don't heal; less than the potion's restore when HP was nearly full. */
  hpRestored: number
  /** The backend's game day, `yyyy-MM-dd`. */
  purchasedOn: string
  purchasedAt: string
  undoneAt: string | null
  isUndone: boolean
  /** Not undone yet and made today (the backend's today). */
  canUndo: boolean
}

/** `GET /api/GameItems`. */
export interface GameItemsResponseDto {
  items: GameItemDto[]
  /** Oldest first, undone ones included. */
  todayPurchases: GameItemPurchaseDto[]
}

/** `POST /api/GameItems/{kind}/Purchase` and `DELETE /api/GameItems/Purchases/{id}`. */
export interface GameItemPurchaseResultDto {
  purchase: GameItemPurchaseDto
  wallet: WalletChangeDto
}
