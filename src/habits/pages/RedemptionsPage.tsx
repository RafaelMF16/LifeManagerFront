import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router-dom'
import { useErrorModal } from '../../shared/hooks/useErrorModal'
import { useToast } from '../../shared/hooks/useToast'
import { isSessionExpiredError } from '../../shared/services/httpClient'
import { isApiError } from '../../shared/types/ApiError'
import RedemptionList from '../components/RedemptionList/RedemptionList'
import { useRedemptions } from '../hooks/useRedemptions'
import type { HabitsOutletContext } from '../types/HabitsOutletContext'
import type { RewardRedemptionDto } from '../types/RewardDtos'
import { formatWalletChange } from '../utils/todayProgress'
import {
  REWARD_ALREADY_UNDONE_CODE,
  REWARD_REDEMPTION_NOT_FOUND_CODE,
  REWARD_UNDO_OUTSIDE_WINDOW_CODE,
} from '../validation/rewardErrorMap'

/** The redemption history; today's redemptions can be undone here, giving the coins back. */
function RedemptionsPage() {
  const { t: translate } = useTranslation(['habits', 'common'])
  const { reloadProfile } = useOutletContext<HabitsOutletContext>()
  const { show: showToast } = useToast()
  const { show: showErrorModal } = useErrorModal()
  const redemptions = useRedemptions()
  const { reload, undoRedemption } = redemptions
  const [pendingId, setPendingId] = useState<number | null>(null)

  async function handleUndo(redemption: RewardRedemptionDto) {
    setPendingId(redemption.id)
    try {
      const { wallet } = await undoRedemption(redemption.id)
      reloadProfile()
      showToast(translate('habits:shop.toasts.undone', { name: redemption.rewardName }), formatWalletChange(wallet, translate))
    } catch (err) {
      if (isSessionExpiredError(err)) return
      const title = translate('habits:shop.redemptions.errorTitle')
      if (!isApiError(err)) {
        showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
      } else if (err.code === REWARD_UNDO_OUTSIDE_WINDOW_CODE) {
        // The day turned while the page was open.
        showErrorModal(title, translate('habits:shop.redemptions.outsideWindow'))
        reload()
      } else if (err.code === REWARD_ALREADY_UNDONE_CODE || err.code === REWARD_REDEMPTION_NOT_FOUND_CODE) {
        // Undone in another tab: the refreshed list and profile already show it.
        reload()
        reloadProfile()
      } else {
        showErrorModal(title, translate('common:errors.generic'))
        reload()
      }
    } finally {
      setPendingId(null)
    }
  }

  return (
    <RedemptionList
      data={redemptions.data}
      status={redemptions.status}
      isFetching={redemptions.isFetching}
      onPageChange={redemptions.setPage}
      onRetry={reload}
      onUndo={(redemption) => void handleUndo(redemption)}
      pendingId={pendingId}
    />
  )
}

export default RedemptionsPage
