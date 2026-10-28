import { apiRequest } from '../../shared/services/httpClient'
import type { GameItemKind, GameItemPurchaseResultDto, GameItemsResponseDto } from '../types/GameItemDtos'

const GAME_ITEMS_PATH = '/api/GameItems'

export function getGameItems(signal?: AbortSignal): Promise<GameItemsResponseDto> {
  return apiRequest<GameItemsResponseDto>(GAME_ITEMS_PATH, { method: 'GET', signal })
}

/** Buys one item and applies it at once; rejects with a `GameItems.*` code when a limit, the effect or the coins stop it. */
export function purchaseGameItem(kind: GameItemKind): Promise<GameItemPurchaseResultDto> {
  return apiRequest<GameItemPurchaseResultDto>(`${GAME_ITEMS_PATH}/${kind}/Purchase`, { method: 'POST' })
}

/** Gives a purchase's coins back and takes the item back; only on the day it was made. */
export function undoGameItemPurchase(purchaseId: number): Promise<GameItemPurchaseResultDto> {
  return apiRequest<GameItemPurchaseResultDto>(`${GAME_ITEMS_PATH}/Purchases/${purchaseId}`, { method: 'DELETE' })
}
