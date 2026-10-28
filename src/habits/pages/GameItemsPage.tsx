import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router-dom'
import { useErrorModal } from '../../shared/hooks/useErrorModal'
import { useToast } from '../../shared/hooks/useToast'
import { isSessionExpiredError } from '../../shared/services/httpClient'
import { isApiError } from '../../shared/types/ApiError'
import GameItemList from '../components/GameItemList/GameItemList'
import GameItemPurchaseList from '../components/GameItemPurchaseList/GameItemPurchaseList'
import PurchaseItemDialog from '../components/PurchaseItemDialog/PurchaseItemDialog'
import { useGameItems } from '../hooks/useGameItems'
import { purchaseGameItem, undoGameItemPurchase } from '../services/gameItemService'
import type { GameItemDto, GameItemPurchaseDto } from '../types/GameItemDtos'
import type { HabitsOutletContext } from '../types/HabitsOutletContext'
import { gameItemName } from '../utils/gameItems'
import { formatWalletChange } from '../utils/todayProgress'
import { gameItemErrorMessages, SILENT_GAME_ITEM_CODES } from '../validation/gameItemErrorMap'

/** The shop's game items: bought here with coins, applied at once; today's purchases can be undone here. */
function GameItemsPage() {
  const { t: translate } = useTranslation(['habits', 'common'])
  const { profile, reloadProfile } = useOutletContext<HabitsOutletContext>()
  const { show: showToast } = useToast()
  const { show: showErrorModal } = useErrorModal()
  const gameItems = useGameItems()
  const { reload } = gameItems
  const [purchaseTarget, setPurchaseTarget] = useState<GameItemDto | null>(null)
  const [pendingUndoId, setPendingUndoId] = useState<number | null>(null)

  /** Every refusal comes from a state that changed since the shop loaded, so both the shop and the profile reload. */
  function showActionError(err: unknown, titleKey: string) {
    if (isSessionExpiredError(err)) return
    if (!isApiError(err)) {
      showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
      return
    }

    if (!SILENT_GAME_ITEM_CODES.has(err.code)) {
      showErrorModal(translate(titleKey), translate(gameItemErrorMessages[err.code] ?? 'common:errors.generic'))
    }
    reload()
    reloadProfile()
  }

  async function handleConfirmPurchase(item: GameItemDto) {
    try {
      const { wallet } = await purchaseGameItem(item.kind)
      reloadProfile()
      reload()
      showToast(translate('habits:shop.toasts.purchased', { name: gameItemName(item.kind, translate) }), formatWalletChange(wallet, translate))
    } catch (err) {
      showActionError(err, 'habits:shop.items.purchase.errorTitle')
    }
    setPurchaseTarget(null)
  }

  async function handleUndo(purchase: GameItemPurchaseDto) {
    setPendingUndoId(purchase.id)
    try {
      const { wallet } = await undoGameItemPurchase(purchase.id)
      reloadProfile()
      reload()
      showToast(translate('habits:shop.toasts.purchaseUndone', { name: gameItemName(purchase.kind, translate) }), formatWalletChange(wallet, translate))
    } catch (err) {
      showActionError(err, 'habits:shop.items.today.errorTitle')
    } finally {
      setPendingUndoId(null)
    }
  }

  return (
    <>
      <GameItemList
        items={gameItems.data?.items}
        status={gameItems.status}
        isFetching={gameItems.isFetching}
        profile={profile}
        onRetry={reload}
        onBuy={setPurchaseTarget}
      />

      <GameItemPurchaseList
        purchases={gameItems.data?.todayPurchases ?? []}
        onUndo={(purchase) => void handleUndo(purchase)}
        pendingId={pendingUndoId}
      />

      {purchaseTarget ? (
        <PurchaseItemDialog
          item={purchaseTarget}
          profile={profile}
          onClose={() => setPurchaseTarget(null)}
          onConfirm={() => handleConfirmPurchase(purchaseTarget)}
        />
      ) : null}
    </>
  )
}

export default GameItemsPage
