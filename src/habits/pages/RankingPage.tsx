import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import Button from '../../shared/components/Button/Button'
import { useToast } from '../../shared/hooks/useToast'
import { clearPendingInvite, readPendingInvite } from '../../shared/utils/pendingInvite'
import JoinGroupDialog from '../components/JoinGroupDialog/JoinGroupDialog'
import RankingGroupFormModal from '../components/RankingGroupFormModal/RankingGroupFormModal'
import RankingGroupList from '../components/RankingGroupList/RankingGroupList'
import { useRankingGroups } from '../hooks/useRankingData'
import { createRankingGroup } from '../services/rankingService'
import type { RankingGroupDetailsDto } from '../types/RankingDtos'
import type { RankingGroupFormValues } from '../validation/rankingGroupSchema'
import './RankingPage.css'

// Espelha LifeManager.Domain/Ranking/RankingRules.MaxGroupsPerUser.
const MAX_GROUPS = 5

type DialogState = { mode: 'create' } | { mode: 'join'; code?: string }

/** The user's ranking groups: create one, join one by its code (or an invite link) and open each one's ranking. */
function RankingPage() {
  const { t: translate } = useTranslation('habits')
  const navigate = useNavigate()
  const { show: showToast } = useToast()
  const groups = useRankingGroups()
  // An invite link opened before signing in lands here: offer it once.
  const [dialog, setDialog] = useState<DialogState | null>(() => {
    const code = readPendingInvite()
    return code ? { mode: 'join', code } : null
  })

  useEffect(() => clearPendingInvite(), [])

  const atLimit = (groups.data?.length ?? 0) >= MAX_GROUPS

  async function handleCreate(values: RankingGroupFormValues) {
    const group = await createRankingGroup(values)
    showToast(translate('habits:ranking.toasts.created', { name: group.name }))
    navigate(`/habits/ranking/${group.id}`)
  }

  function handleJoined(group: RankingGroupDetailsDto) {
    showToast(translate('habits:ranking.toasts.joined', { name: group.name }))
    navigate(`/habits/ranking/${group.id}`)
  }

  return (
    <main className="lm-ranking-page">
      <div className="lm-ranking-page__heading">
        <span className="lm-ranking-page__eyebrow">{translate('habits:module.name')}</span>
        <h1 className="lm-ranking-page__title">{translate('habits:ranking.title')}</h1>
        <p className="lm-ranking-page__intro">{translate('habits:ranking.intro')}</p>
      </div>

      <div className="lm-ranking-page__actions" data-tour="ranking.actions">
        <Button variant="primary" icon="plus" disabled={atLimit} onClick={() => setDialog({ mode: 'create' })}>
          {translate('habits:ranking.list.create')}
        </Button>
        <Button variant="secondary" icon="log-in" disabled={atLimit} onClick={() => setDialog({ mode: 'join' })}>
          {translate('habits:ranking.list.join')}
        </Button>
        {atLimit ? <span className="lm-ranking-page__limit">{translate('habits:ranking.list.limit', { count: MAX_GROUPS })}</span> : null}
      </div>

      <RankingGroupList groups={groups.data} status={groups.status} isFetching={groups.isFetching} onRetry={groups.reload} />

      {dialog?.mode === 'create' ? <RankingGroupFormModal onClose={() => setDialog(null)} onSubmit={handleCreate} /> : null}
      {dialog?.mode === 'join' ? (
        <JoinGroupDialog initialCode={dialog.code} onClose={() => setDialog(null)} onJoined={handleJoined} />
      ) : null}
    </main>
  )
}

export default RankingPage
