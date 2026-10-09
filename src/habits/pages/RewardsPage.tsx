import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router-dom'
import Button from '../../shared/components/Button/Button'
import { useErrorModal } from '../../shared/hooks/useErrorModal'
import { useToast } from '../../shared/hooks/useToast'
import { isSessionExpiredError } from '../../shared/services/httpClient'
import { isApiError } from '../../shared/types/ApiError'
import ArchiveRewardModal from '../components/ArchiveRewardModal/ArchiveRewardModal'
import RedeemRewardDialog from '../components/RedeemRewardDialog/RedeemRewardDialog'
import RewardFormModal from '../components/RewardFormModal/RewardFormModal'
import RewardList from '../components/RewardList/RewardList'
import { useEarningPace } from '../hooks/useEarningPace'
import { useRewards } from '../hooks/useRewards'
import { redeemReward } from '../services/rewardService'
import type { HabitsOutletContext } from '../types/HabitsOutletContext'
import type { RewardResponseDto } from '../types/RewardDtos'
import { rewardTemplateValues } from '../utils/starterTemplates'
import type { RewardTemplateId } from '../utils/starterTemplates'
import { formatWalletChange } from '../utils/todayProgress'
import {
  REWARD_ARCHIVED_CODE,
  REWARD_INSUFFICIENT_COINS_CODE,
  REWARD_NAME_ALREADY_EXISTS_CODE,
  REWARD_NOT_FOUND_CODE,
} from '../validation/rewardErrorMap'
import type { RewardFormValues } from '../validation/rewardSchema'

type FormTarget = { mode: 'create'; template?: RewardTemplateId } | { mode: 'edit'; reward: RewardResponseDto }

/** The shop's rewards: created, edited, archived, restored and redeemed here. */
function RewardsPage() {
  const { t: translate } = useTranslation(['habits', 'common'])
  const { profile, reloadProfile } = useOutletContext<HabitsOutletContext>()
  const { show: showToast } = useToast()
  const { show: showErrorModal } = useErrorModal()
  const rewards = useRewards()
  const { reload, createReward, updateReward, archiveReward, restoreReward } = rewards
  const pace = useEarningPace()
  const [formTarget, setFormTarget] = useState<FormTarget | null>(null)
  const [archiveTarget, setArchiveTarget] = useState<RewardResponseDto | null>(null)
  const [redeemTarget, setRedeemTarget] = useState<RewardResponseDto | null>(null)
  const [pendingId, setPendingId] = useState<number | null>(null)

  async function handleSubmitForm(values: RewardFormValues) {
    if (formTarget?.mode === 'edit') {
      await updateReward(formTarget.reward.id, values)
      showToast(translate('habits:shop.toasts.updated'))
    } else {
      await createReward(values)
      showToast(translate('habits:shop.toasts.created'))
    }
    setFormTarget(null)
  }

  /** Shows a failed action; a reward that is gone or archived elsewhere also refreshes the list. */
  function showActionError(err: unknown, titleKey: string) {
    if (isSessionExpiredError(err)) return
    if (!isApiError(err)) {
      showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
    } else if (err.code === REWARD_INSUFFICIENT_COINS_CODE) {
      // The balance changed elsewhere (another tab, the day close): the refreshed profile shows the real one.
      showErrorModal(translate(titleKey), translate('habits:shop.redeem.insufficient'))
      reloadProfile()
    } else if (err.code === REWARD_NOT_FOUND_CODE || err.code === REWARD_ARCHIVED_CODE) {
      showErrorModal(translate(titleKey), translate('habits:shop.validation.gone'))
      reload()
    } else if (err.code === REWARD_NAME_ALREADY_EXISTS_CODE) {
      showErrorModal(translate(titleKey), translate('habits:shop.restore.nameTaken'))
    } else {
      showErrorModal(translate(titleKey), translate('common:errors.generic'))
      reload()
    }
  }

  async function handleConfirmRedeem(reward: RewardResponseDto) {
    try {
      const { wallet } = await redeemReward(reward.id)
      reloadProfile()
      showToast(translate('habits:shop.toasts.redeemed', { name: reward.name }), formatWalletChange(wallet, translate))
    } catch (err) {
      showActionError(err, 'habits:shop.redeem.errorTitle')
    }
    setRedeemTarget(null)
  }

  async function handleConfirmArchive(reward: RewardResponseDto) {
    try {
      await archiveReward(reward.id)
      showToast(translate('habits:shop.toasts.archived'))
    } catch (err) {
      showActionError(err, 'habits:shop.archive.errorTitle')
    }
    setArchiveTarget(null)
  }

  async function handleRestore(reward: RewardResponseDto) {
    setPendingId(reward.id)
    try {
      await restoreReward(reward.id)
      showToast(translate('habits:shop.toasts.restored'))
    } catch (err) {
      showActionError(err, 'habits:shop.restore.errorTitle')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <>
      <div className="lm-shop-page__actions">
        <Button variant="primary" icon="plus" onClick={() => setFormTarget({ mode: 'create' })}>
          {translate('habits:shop.newButton')}
        </Button>
      </div>

      <RewardList
        data={rewards.data}
        status={rewards.status}
        isFetching={rewards.isFetching}
        statusFilter={rewards.statusFilter}
        onStatusFilterChange={rewards.setStatusFilter}
        searchInput={rewards.searchInput}
        onSearchChange={rewards.setSearchInput}
        appliedSearch={rewards.search}
        sortBy={rewards.sortBy}
        sortDirection={rewards.sortDirection}
        onSortByChange={rewards.changeSortBy}
        onToggleSortDirection={rewards.toggleSortDirection}
        onPageChange={rewards.setPage}
        onRetry={reload}
        coins={profile?.coins}
        averageDailyCoins={pace?.averageDailyCoins}
        onCreate={() => setFormTarget({ mode: 'create' })}
        onCreateFromTemplate={(template) => setFormTarget({ mode: 'create', template })}
        onRedeem={setRedeemTarget}
        onEdit={(reward) => setFormTarget({ mode: 'edit', reward })}
        onArchive={setArchiveTarget}
        onRestore={(reward) => void handleRestore(reward)}
        pendingId={pendingId}
      />

      {formTarget ? (
        <RewardFormModal
          reward={formTarget.mode === 'edit' ? formTarget.reward : undefined}
          initialValues={formTarget.mode === 'create' && formTarget.template ? rewardTemplateValues(formTarget.template, translate) : undefined}
          onClose={() => setFormTarget(null)}
          onSubmit={handleSubmitForm}
        />
      ) : null}

      {redeemTarget ? (
        <RedeemRewardDialog
          reward={redeemTarget}
          coins={profile?.coins}
          onClose={() => setRedeemTarget(null)}
          onConfirm={() => handleConfirmRedeem(redeemTarget)}
        />
      ) : null}

      {archiveTarget ? (
        <ArchiveRewardModal
          reward={archiveTarget}
          onClose={() => setArchiveTarget(null)}
          onConfirm={() => handleConfirmArchive(archiveTarget)}
        />
      ) : null}
    </>
  )
}

export default RewardsPage
