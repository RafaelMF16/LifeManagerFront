import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../shared/components/Button/Button'
import Pagination from '../../shared/components/Pagination/Pagination'
import SegmentedControl from '../../shared/components/SegmentedControl/SegmentedControl'
import { useErrorModal } from '../../shared/hooks/useErrorModal'
import { useToast } from '../../shared/hooks/useToast'
import { isSessionExpiredError } from '../../shared/services/httpClient'
import { isApiError } from '../../shared/types/ApiError'
import ChallengeCard from '../components/ChallengeCard/ChallengeCard'
import ChallengeFormDialog from '../components/ChallengeFormDialog/ChallengeFormDialog'
import ChallengeSuggestionList from '../components/ChallengeSuggestionList/ChallengeSuggestionList'
import ConfirmActionDialog from '../components/ConfirmActionDialog/ConfirmActionDialog'
import { useChallengeHistory, useChallengeWeek } from '../hooks/useChallenges'
import { createChallenge, deleteChallenge } from '../services/challengeService'
import type { ChallengeDto, ChallengeSuggestionDto, ChallengeWeek, ChallengeWeekDto } from '../types/ChallengeDtos'
import { groupByWeek } from '../utils/challenges'
import { formatWeekRange, weekEndOf } from '../utils/ranking'
import { challengeWeekErrorKey, CHALLENGE_NOT_ACTIVE_CODE, CHALLENGE_NOT_FOUND_CODE } from '../validation/challengeErrorMap'
import './ChallengesPage.css'

const WEEKS: ChallengeWeek[] = ['Current', 'Next']

// Espelha LifeManager.Domain/Habits/GameRules.MaxChallengesPerWeek.
const MAX_CHALLENGES_PER_WEEK = 3

/** `/habits/challenges`: plan this week and the next (create, accept a suggestion, give up) and look back at past weeks. */
function ChallengesPage() {
  const { t: translate, i18n } = useTranslation(['habits', 'common'])
  const { show: showToast } = useToast()
  const { show: showErrorModal } = useErrorModal()
  const [week, setWeek] = useState<ChallengeWeek>('Current')
  const [historyPage, setHistoryPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [cancelling, setCancelling] = useState<ChallengeDto | null>(null)
  const [acceptingHabitId, setAcceptingHabitId] = useState<number | null>(null)
  const current = useChallengeWeek(week)
  const history = useChallengeHistory(historyPage)

  function showConnectionError() {
    showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
  }

  function handleCreated(challenge: ChallengeDto) {
    setFormOpen(false)
    showToast(translate('habits:challenges.toasts.created', { habit: challenge.habitName }))
    current.reload()
  }

  async function accept(suggestion: ChallengeSuggestionDto) {
    setAcceptingHabitId(suggestion.habitId)
    try {
      const challenge = await createChallenge({ habitId: suggestion.habitId, type: suggestion.type, target: suggestion.target, week })
      showToast(translate('habits:challenges.toasts.created', { habit: challenge.habitName }))
    } catch (err) {
      if (isSessionExpiredError(err)) return
      // The week changed meanwhile (another tab, Wednesday ended): the reload below shows how it is now.
      if (isApiError(err)) showToast(translate(challengeWeekErrorKey(err.code) ?? 'habits:challenges.errors.acceptFailed'))
      else showConnectionError()
    } finally {
      setAcceptingHabitId(null)
      current.reload()
    }
  }

  async function confirmCancel() {
    if (!cancelling) return
    try {
      await deleteChallenge(cancelling.id)
      showToast(translate('habits:challenges.toasts.cancelled', { habit: cancelling.habitName }))
    } catch (err) {
      if (isSessionExpiredError(err)) return
      if (isApiError(err) && (err.code === CHALLENGE_NOT_ACTIVE_CODE || err.code === CHALLENGE_NOT_FOUND_CODE)) {
        showToast(translate('habits:challenges.errors.changed'))
      } else if (isApiError(err)) {
        showToast(translate('habits:challenges.errors.cancelFailed'))
      } else {
        showConnectionError()
      }
    } finally {
      setCancelling(null)
      current.reload()
    }
  }

  return (
    <main className="lm-challenges-page">
      <div className="lm-challenges-page__heading">
        <span className="lm-challenges-page__eyebrow">{translate('habits:module.name')}</span>
        <h1 className="lm-challenges-page__title">{translate('habits:challenges.title')}</h1>
        <p className="lm-challenges-page__intro">{translate('habits:challenges.intro')}</p>
      </div>

      <section className="lm-challenges-page__week" aria-labelledby="lm-challenges-week-title">
        <div className="lm-challenges-page__week-header">
          <SegmentedControl
            size="md"
            aria-label={translate('habits:challenges.weeks.aria')}
            options={WEEKS.map((value) => ({ value, label: translate(`habits:challenges.weeks.${value}`) }))}
            value={week}
            onChange={setWeek}
            className="lm-challenges-page__weeks"
          />
          <h2 id="lm-challenges-week-title" className="lm-challenges-page__range" data-tour="challenges.weeks">
            {current.data ? formatWeekRange(current.data.weekStart, current.data.weekEnd, i18n.language) : translate(`habits:challenges.weeks.${week}`)}
          </h2>
        </div>
        {renderWeek()}
      </section>

      <section className="lm-challenges-page__history" aria-labelledby="lm-challenges-history-title" data-tour="challenges.history">
        <h2 id="lm-challenges-history-title" className="lm-challenges-page__section-title">
          {translate('habits:challenges.history.title')}
        </h2>
        {renderHistory()}
      </section>

      {formOpen && current.data ? (
        <ChallengeFormDialog week={current.data} onClose={() => setFormOpen(false)} onCreated={handleCreated} />
      ) : null}
      {cancelling ? (
        <ConfirmActionDialog
          title={translate('habits:challenges.cancel.title')}
          message={translate('habits:challenges.cancel.message', { habit: cancelling.habitName })}
          confirmLabel={translate('habits:challenges.cancel.confirm')}
          confirmIcon="x"
          onClose={() => setCancelling(null)}
          onConfirm={confirmCancel}
        />
      ) : null}
    </main>
  )

  function renderWeek() {
    if (!current.data) {
      if (current.status === 'error') {
        return (
          <div className="lm-challenges-page__state">
            <p>{translate('habits:challenges.loadError')}</p>
            <Button variant="secondary" size="sm" icon="refresh-cw" onClick={current.reload}>
              {translate('habits:challenges.retry')}
            </Button>
          </div>
        )
      }
      return <p className="lm-challenges-page__state">{translate('habits:challenges.loading')}</p>
    }

    const data = current.data
    return (
      <div className={`lm-challenges-page__panel${current.isFetching ? ' lm-challenges-page__panel--fetching' : ''}`}>
        {data.challenges.length > 0 ? (
          <ul className="lm-challenges-page__list" data-tour="challenges.list">
            {data.challenges.map((challenge) => (
              <li key={challenge.id}>
                <ChallengeCard challenge={challenge} onCancel={setCancelling} cancelling={cancelling?.id === challenge.id} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="lm-challenges-page__state">{translate(`habits:challenges.empty.${week}`)}</p>
        )}

        <div className="lm-challenges-page__actions" data-tour="challenges.create">
          <Button variant="primary" icon="plus" disabled={!data.canCreate} onClick={() => setFormOpen(true)}>
            {translate('habits:challenges.newChallenge')}
          </Button>
          {data.canCreate ? null : <span className="lm-challenges-page__why">{translate(whyClosed(data))}</span>}
        </div>

        {data.suggestions.length > 0 ? (
          <ChallengeSuggestionList suggestions={data.suggestions} pendingHabitId={acceptingHabitId} onAccept={(suggestion) => void accept(suggestion)} />
        ) : null}
      </div>
    )
  }

  function renderHistory() {
    const data = history.data
    if (!data) {
      return history.status === 'error' ? (
        <div className="lm-challenges-page__state">
          <p>{translate('habits:challenges.history.loadError')}</p>
          <Button variant="secondary" size="sm" icon="refresh-cw" onClick={history.reload}>
            {translate('habits:challenges.retry')}
          </Button>
        </div>
      ) : (
        <p className="lm-challenges-page__state">{translate('habits:challenges.history.loading')}</p>
      )
    }
    if (data.totalCount === 0) return <p className="lm-challenges-page__state">{translate('habits:challenges.history.empty')}</p>

    const from = (data.page - 1) * data.pageSize + 1
    return (
      <>
        {groupByWeek(data.items).map((group) => (
          <div key={group.weekStart} className="lm-challenges-page__history-week">
            <h3 className="lm-challenges-page__history-range">
              {formatWeekRange(group.weekStart, weekEndOf(group.weekStart), i18n.language)}
            </h3>
            <ul className="lm-challenges-page__list">
              {group.challenges.map((challenge) => (
                <li key={challenge.id}>
                  <ChallengeCard challenge={challenge} />
                </li>
              ))}
            </ul>
          </div>
        ))}
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          rangeLabel={translate('habits:challenges.history.range', { from, to: from + data.items.length - 1, count: data.totalCount })}
          onPageChange={setHistoryPage}
        />
      </>
    )
  }
}

/** Why the week takes no new challenge: closed (after Wednesday), full, or no habit left to pick. */
function whyClosed(week: ChallengeWeekDto) {
  if (!week.isOpen) return 'habits:challenges.why.closed'
  if (week.challenges.length >= MAX_CHALLENGES_PER_WEEK) return 'habits:challenges.why.full'
  return 'habits:challenges.why.noHabits'
}

export default ChallengesPage
