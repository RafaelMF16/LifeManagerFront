// Espelha os códigos de LifeManager.Domain/GameItems/Errors/GameItemErrors.cs
export const GAME_ITEM_UNKNOWN_ITEM_CODE = 'GameItems.UnknownItem'
export const GAME_ITEM_INSUFFICIENT_COINS_CODE = 'GameItems.InsufficientCoins'
export const GAME_ITEM_HP_FULL_CODE = 'GameItems.HpFull'
export const GAME_ITEM_STREAK_FREEZES_FULL_CODE = 'GameItems.StreakFreezesFull'
export const GAME_ITEM_DAILY_LIMIT_REACHED_CODE = 'GameItems.DailyLimitReached'
export const GAME_ITEM_WEEKLY_LIMIT_REACHED_CODE = 'GameItems.WeeklyLimitReached'
export const GAME_ITEM_PURCHASE_NOT_FOUND_CODE = 'GameItems.PurchaseNotFound'
export const GAME_ITEM_UNDO_OUTSIDE_WINDOW_CODE = 'GameItems.UndoOutsideWindow'
export const GAME_ITEM_ALREADY_UNDONE_CODE = 'GameItems.AlreadyUndone'
export const GAME_ITEM_ALREADY_USED_CODE = 'GameItems.ItemAlreadyUsed'

/**
 * The message for each refusal the player can meet, as a translation key. They all come from a state that changed
 * since the shop loaded (another tab, the day close, the day turning), so the page reloads after showing one.
 */
export const gameItemErrorMessages: Record<string, string> = {
  [GAME_ITEM_INSUFFICIENT_COINS_CODE]: 'habits:shop.items.errors.insufficientCoins',
  [GAME_ITEM_HP_FULL_CODE]: 'habits:shop.items.errors.hpFull',
  [GAME_ITEM_STREAK_FREEZES_FULL_CODE]: 'habits:shop.items.errors.freezesFull',
  [GAME_ITEM_DAILY_LIMIT_REACHED_CODE]: 'habits:shop.items.errors.dailyLimit',
  [GAME_ITEM_WEEKLY_LIMIT_REACHED_CODE]: 'habits:shop.items.errors.weeklyLimit',
  [GAME_ITEM_UNDO_OUTSIDE_WINDOW_CODE]: 'habits:shop.items.errors.outsideWindow',
  [GAME_ITEM_ALREADY_USED_CODE]: 'habits:shop.items.errors.alreadyUsed',
}

/** Undone or gone in another tab: the reloaded shop already shows it, so there is nothing to explain. */
export const SILENT_GAME_ITEM_CODES: ReadonlySet<string> = new Set([GAME_ITEM_ALREADY_UNDONE_CODE, GAME_ITEM_PURCHASE_NOT_FOUND_CODE])
