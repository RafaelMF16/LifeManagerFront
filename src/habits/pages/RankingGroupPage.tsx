import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../../shared/components/Button/Button'
import IconButton from '../../shared/components/IconButton/IconButton'
import { useErrorModal } from '../../shared/hooks/useErrorModal'
import { useToast } from '../../shared/hooks/useToast'
import { isSessionExpiredError } from '../../shared/services/httpClient'
import { isApiError } from '../../shared/types/ApiError'
import RankingBoard from '../components/RankingBoard/RankingBoard'
import ConfirmActionDialog from '../components/ConfirmActionDialog/ConfirmActionDialog'
import RankingGroupFormModal from '../components/RankingGroupFormModal/RankingGroupFormModal'
import RankingMembers from '../components/RankingMembers/RankingMembers'
import RankingMyWeek from '../components/RankingMyWeek/RankingMyWeek'
import RankingPreviousCard from '../components/RankingPreviousCard/RankingPreviousCard'
import { useGroupRanking, useRankingGroup } from '../hooks/useRankingData'
import {
  leaveRankingGroup,
  regenerateInviteCode,
  removeRankingMember,
  removeRankingReaction,
  renameRankingGroup,
  setRankingReaction,
} from '../services/rankingService'
import type { RankingEntryDto, RankingGroupMemberDto, RankingReactionKind } from '../types/RankingDtos'
import { addWeeks, canReactTo, formatWeekRange, inviteLink, patchReactions, WEEK_STATUS_TONE, withMyReaction } from '../utils/ranking'
import { RANKING_GROUP_NOT_FOUND_CODE, RANKING_MEMBER_NOT_FOUND_CODE, RANKING_NOT_OWNER_CODE } from '../validation/rankingErrorMap'
import type { RankingGroupFormValues } from '../validation/rankingGroupSchema'
import './RankingPage.css'
import './RankingGroupPage.css'

type DialogState =
  | { mode: 'rename' }
  | { mode: 'leave' }
  | { mode: 'regenerate' }
  | { mode: 'remove'; member: RankingGroupMemberDto }

/** One group: the week's ranking (live, closing or final) with my points and last week's podium, then the members. */
function RankingGroupPage() {
  const { t: translate, i18n } = useTranslation(['habits', 'common'])
  const navigate = useNavigate()
  const { show: showToast } = useToast()
  const { show: showErrorModal } = useErrorModal()
  const groupId = Number(useParams().groupId)
  const [weekStart, setWeekStart] = useState<string | null>(null)
  const [dialog, setDialog] = useState<DialogState | null>(null)
  const [pendingMemberIds, setPendingMemberIds] = useState<ReadonlySet<number>>(new Set())
  const group = useRankingGroup(groupId)
  const ranking = useGroupRanking(groupId, weekStart)
  const details = group.data
  const data = ranking.data

  if (group.errorCode === RANKING_GROUP_NOT_FOUND_CODE || ranking.errorCode === RANKING_GROUP_NOT_FOUND_CODE) {
    return (
      <main className="lm-ranking-group-page">
        <div className="lm-ranking-group-page__state" role="alert">
          <p>{translate('habits:ranking.group.notFound')}</p>
          <Link to="/habits/ranking">{translate('habits:ranking.group.back')}</Link>
        </div>
      </main>
    )
  }

  /** Shows a failed action; anything about a group or member that changed elsewhere refreshes both reads. */
  function showActionError(err: unknown, titleKey: string) {
    if (isSessionExpiredError(err)) return
    if (!isApiError(err)) {
      showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
      return
    }
    const messageKey =
      err.code === RANKING_NOT_OWNER_CODE
        ? 'habits:ranking.validation.notOwner'
        : err.code === RANKING_MEMBER_NOT_FOUND_CODE || err.code === RANKING_GROUP_NOT_FOUND_CODE
          ? 'habits:ranking.validation.gone'
          : 'common:errors.generic'
    showErrorModal(translate(titleKey), translate(messageKey))
    group.reload()
    ranking.reload()
  }

  async function react(entry: RankingEntryDto, week: string, kind: RankingReactionKind | null) {
    const memberId = entry.memberId
    if (memberId === null) return
    const before = entry.reactions
    setPendingMemberIds((ids) => new Set(ids).add(memberId))
    ranking.replace((current) => patchReactions(current, week, memberId, withMyReaction(before, kind)))
    try {
      const saved = kind
        ? await setRankingReaction(groupId, memberId, week, kind)
        : await removeRankingReaction(groupId, memberId, week)
      ranking.replace((current) => patchReactions(current, week, memberId, saved))
    } catch (err) {
      ranking.replace((current) => patchReactions(current, week, memberId, before))
      if (!isSessionExpiredError(err)) showToast(translate('habits:ranking.reactions.failed'))
      if (isApiError(err) && err.code === RANKING_MEMBER_NOT_FOUND_CODE) ranking.reload()
    } finally {
      setPendingMemberIds((ids) => {
        const next = new Set(ids)
        next.delete(memberId)
        return next
      })
    }
  }

  async function copy(text: string, toastKey: string) {
    try {
      await navigator.clipboard.writeText(text)
      showToast(translate(toastKey))
    } catch {
      showErrorModal(translate('habits:ranking.invite.copyFailedTitle'), text)
    }
  }

  async function handleRename(values: RankingGroupFormValues) {
    const renamed = await renameRankingGroup(groupId, values)
    group.replace(() => renamed)
    showToast(translate('habits:ranking.toasts.renamed'))
    setDialog(null)
  }

  async function handleRegenerate() {
    try {
      const renewed = await regenerateInviteCode(groupId)
      group.replace(() => renewed)
      showToast(translate('habits:ranking.toasts.newCode'))
      setDialog(null)
    } catch (err) {
      setDialog(null)
      showActionError(err, 'habits:ranking.invite.regenerateFailed')
    }
  }

  async function handleRemove(member: RankingGroupMemberDto) {
    try {
      await removeRankingMember(groupId, member.memberId)
      showToast(translate('habits:ranking.toasts.removed', { name: member.name }))
      setDialog(null)
      group.reload()
      ranking.reload()
    } catch (err) {
      setDialog(null)
      showActionError(err, 'habits:ranking.members.removeFailed')
    }
  }

  async function handleLeave() {
    try {
      await leaveRankingGroup(groupId)
      showToast(translate('habits:ranking.toasts.left', { name: details?.name ?? '' }))
      navigate('/habits/ranking')
    } catch (err) {
      setDialog(null)
      showActionError(err, 'habits:ranking.leave.failed')
    }
  }

  const tone = data ? WEEK_STATUS_TONE[data.status] : null
  const isFirstWeek = data ? data.weekStart <= data.firstWeekStart : true

  return (
    <main className="lm-ranking-group-page">
      <div className="lm-ranking-group-page__heading">
        <Link to="/habits/ranking" className="lm-ranking-group-page__back">
          {translate('habits:ranking.group.back')}
        </Link>
        <div className="lm-ranking-group-page__title-row">
          <h1 className="lm-ranking-page__title">{details?.name ?? translate('habits:ranking.title')}</h1>
          {details?.isOwner ? (
            <IconButton icon="pencil" size="sm" label={translate('habits:ranking.group.rename')} onClick={() => setDialog({ mode: 'rename' })} />
          ) : null}
        </div>
      </div>

      {data ? (
        <>
          <div className="lm-ranking-group-page__week" data-tour="ranking.week">
            <IconButton
              icon="chevron-left"
              size="sm"
              variant="secondary"
              label={translate('habits:ranking.week.previous')}
              disabled={isFirstWeek || ranking.isFetching}
              onClick={() => setWeekStart(addWeeks(data.weekStart, -1))}
            />
            <span className="lm-ranking-group-page__range">{formatWeekRange(data.weekStart, data.weekEnd, i18n.language)}</span>
            <IconButton
              icon="chevron-right"
              size="sm"
              variant="secondary"
              label={translate('habits:ranking.week.next')}
              disabled={data.status === 'Open' || ranking.isFetching}
              onClick={() => setWeekStart(addWeeks(data.weekStart, 1))}
            />
            <span className={`lm-ranking-group-page__status lm-ranking-group-page__status--${tone}`}>
              {translate(`habits:ranking.week.status.${data.status}`)}
            </span>
            {data.status !== 'Final' ? (
              <span className="lm-ranking-group-page__status-hint">{translate(`habits:ranking.week.hint.${data.status}`)}</span>
            ) : null}
          </div>

          {data.overtakenBy.length > 0 || (data.status === 'Open' && data.me.nextName) ? (
            <div className="lm-ranking-group-page__notices" role="status">
              {data.overtakenBy.length > 0 ? (
                <p className="lm-ranking-group-page__notice lm-ranking-group-page__notice--alert">
                  {translate('habits:ranking.notices.overtaken', {
                    names: new Intl.ListFormat(i18n.language, { type: 'conjunction' }).format(data.overtakenBy.map((member) => member.name)),
                    count: data.overtakenBy.length,
                  })}
                </p>
              ) : null}
              {data.status === 'Open' && data.me.nextName && data.me.gapToNext !== null ? (
                <p className="lm-ranking-group-page__notice">
                  {data.me.gapToNext > 0
                    ? translate('habits:ranking.notices.gap', { count: data.me.gapToNext, name: data.me.nextName })
                    : translate('habits:ranking.notices.tie', { name: data.me.nextName })}
                </p>
              ) : null}
            </div>
          ) : null}

          {data.previous ? (
            <RankingPreviousCard
              previous={data.previous}
              pendingMemberIds={pendingMemberIds}
              onReact={(entry, kind) => void react(entry, data.previous!.weekStart, kind)}
            />
          ) : null}

          <section
            className={`lm-ranking-group-page__board${ranking.isFetching ? ' lm-ranking-group-page__board--fetching' : ''}`}
            aria-label={translate('habits:ranking.board.aria')}
            data-tour="ranking.board"
          >
            <RankingBoard
              entries={data.entries}
              canReact={canReactTo(data.weekStart)}
              pendingMemberIds={pendingMemberIds}
              onReact={(entry, kind) => void react(entry, data.weekStart, kind)}
            />
            {!data.countsForAchievements ? (
              <p className="lm-ranking-group-page__note">{translate('habits:ranking.board.noAchievements')}</p>
            ) : null}
          </section>

          <RankingMyWeek days={data.me.days} points={data.me.points} challengePoints={data.me.challengePoints} />
        </>
      ) : ranking.status === 'error' ? (
        <div className="lm-ranking-group-page__state" role="alert">
          <p>{translate('habits:ranking.group.loadError')}</p>
          <Button variant="secondary" size="sm" onClick={ranking.reload}>
            {translate('habits:ranking.retry')}
          </Button>
        </div>
      ) : (
        <p className="lm-ranking-group-page__state" role="status">
          {translate('habits:ranking.group.loading')}
        </p>
      )}

      {details ? (
        <RankingMembers
          group={details}
          onCopyLink={() => void copy(inviteLink(details.inviteCode, window.location.origin), 'habits:ranking.toasts.linkCopied')}
          onCopyCode={() => void copy(details.inviteCode, 'habits:ranking.toasts.codeCopied')}
          onRegenerate={() => setDialog({ mode: 'regenerate' })}
          onRemove={(member) => setDialog({ mode: 'remove', member })}
          onLeave={() => setDialog({ mode: 'leave' })}
        />
      ) : null}

      {dialog?.mode === 'rename' && details ? (
        <RankingGroupFormModal name={details.name} onClose={() => setDialog(null)} onSubmit={handleRename} />
      ) : null}
      {dialog?.mode === 'regenerate' ? (
        <ConfirmActionDialog
          title={translate('habits:ranking.invite.regenerateTitle')}
          message={translate('habits:ranking.invite.regenerateMessage')}
          confirmLabel={translate('habits:ranking.invite.regenerate')}
          confirmIcon="refresh-cw"
          variant="primary"
          onClose={() => setDialog(null)}
          onConfirm={handleRegenerate}
        />
      ) : null}
      {dialog?.mode === 'remove' ? (
        <ConfirmActionDialog
          title={translate('habits:ranking.members.removeTitle')}
          message={translate('habits:ranking.members.removeMessage', { name: dialog.member.name })}
          confirmLabel={translate('habits:ranking.members.remove')}
          confirmIcon="user-minus"
          onClose={() => setDialog(null)}
          onConfirm={() => handleRemove(dialog.member)}
        />
      ) : null}
      {dialog?.mode === 'leave' ? (
        <ConfirmActionDialog
          title={translate('habits:ranking.leave.title')}
          message={translate(
            details && details.members.length === 1
              ? 'habits:ranking.leave.messageLast'
              : details?.isOwner
                ? 'habits:ranking.leave.messageOwner'
                : 'habits:ranking.leave.message',
          )}
          confirmLabel={translate('habits:ranking.leave.confirm')}
          confirmIcon="log-out"
          onClose={() => setDialog(null)}
          onConfirm={handleLeave}
        />
      ) : null}
    </main>
  )
}

export default RankingGroupPage
