import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useOutletContext } from 'react-router-dom'
import Button from '../../shared/components/Button/Button'
import Icon from '../../shared/components/Icon/Icon'
import { useErrorModal } from '../../shared/hooks/useErrorModal'
import { useToast } from '../../shared/hooks/useToast'
import { isSessionExpiredError } from '../../shared/services/httpClient'
import { isApiError } from '../../shared/types/ApiError'
import HabitAvoidCard from '../components/HabitAvoidCard/HabitAvoidCard'
import type { RelapseDay } from '../components/HabitAvoidCard/HabitAvoidCard'
import HabitCheckItem from '../components/HabitCheckItem/HabitCheckItem'
import HabitProgressItem from '../components/HabitProgressItem/HabitProgressItem'
import RelapseDialog from '../components/RelapseDialog/RelapseDialog'
import WelcomeBackBanner from '../components/WelcomeBackBanner/WelcomeBackBanner'
import { useHabitsToday } from '../hooks/useHabitsToday'
import type { HabitsOutletContext } from '../types/HabitsOutletContext'
import type {
  HabitAvoidItemDto,
  HabitCheckInResultDto,
  HabitProgressEntryDto,
  HabitProgressResultDto,
  HabitTodayItemDto,
} from '../types/HabitTodayDtos'
import { checkInHighlight, formatDayTitle, formatWalletChange, todayProgress } from '../utils/todayProgress'
import { readWelcomeBackDismissed, shouldWelcomeBack, writeWelcomeBackDismissed } from '../utils/welcomeBack'
import {
  HABIT_ALREADY_CHECKED_IN_CODE,
  HABIT_ALREADY_RELAPSED_CODE,
  HABIT_ARCHIVED_CODE,
  HABIT_CHECK_IN_NOT_FOUND_CODE,
  HABIT_CHECK_IN_OUTSIDE_WINDOW_CODE,
  HABIT_NOT_FOUND_CODE,
  HABIT_PROGRESS_ENTRY_NOT_FOUND_CODE,
  HABIT_PROGRESS_REQUIRED_CODE,
  HABIT_RELAPSE_NOT_FOUND_CODE,
  HABIT_TOO_MANY_PROGRESS_ENTRIES_CODE,
} from '../validation/habitErrorMap'
import StarterSuggestions from '../components/StarterSuggestions/StarterSuggestions'
import { HABIT_TEMPLATES } from '../utils/starterTemplates'
import type { HabitsPageState } from './HabitsPage'
import './TodayPage.css'

/**
 * Changed in another tab or device (a target set elsewhere included): the reloaded list already shows it as it is.
 */
const RELOAD_ONLY_CODES: ReadonlySet<string> = new Set([
  HABIT_ALREADY_CHECKED_IN_CODE,
  HABIT_CHECK_IN_NOT_FOUND_CODE,
  HABIT_ALREADY_RELAPSED_CODE,
  HABIT_RELAPSE_NOT_FOUND_CODE,
  HABIT_PROGRESS_ENTRY_NOT_FOUND_CODE,
  HABIT_PROGRESS_REQUIRED_CODE,
])

/** What a failed save explains; anything else gets the generic message. */
const SAVE_ERROR_MESSAGES: Record<string, string> = {
  [HABIT_CHECK_IN_OUTSIDE_WINDOW_CODE]: 'habits:today.errors.outsideWindow',
  [HABIT_NOT_FOUND_CODE]: 'habits:today.errors.gone',
  [HABIT_ARCHIVED_CODE]: 'habits:today.errors.gone',
  [HABIT_TOO_MANY_PROGRESS_ENTRIES_CODE]: 'habits:today.errors.tooManyEntries',
}

/**
 * The Habits home: today's checklist, with yesterday's leftovers on top while they can still be checked in, then the
 * habits to avoid (relapses) and the ones free today.
 */
function TodayPage() {
  const { t: translate, i18n } = useTranslation(['habits', 'common'])
  const navigate = useNavigate()
  const { profile, reloadProfile } = useOutletContext<HabitsOutletContext>()
  const { show: showToast } = useToast()
  const { show: showErrorModal } = useErrorModal()
  const habits = useHabitsToday()
  const [welcomeDismissedFor, setWelcomeDismissedFor] = useState(readWelcomeBackDismissed)
  const [relapseTarget, setRelapseTarget] = useState<HabitAvoidItemDto | null>(null)

  // A streak freeze would cover yesterday if it's left unchecked: the warning says so instead of alarming.
  const yesterdayRisk = (profile?.streakFreezes ?? 0) > 0 ? 'protected' : 'unprotected'

  function dismissWelcomeBack() {
    if (!habits.lastMissedOn) return
    writeWelcomeBackDismissed(habits.lastMissedOn)
    setWelcomeDismissedFor(habits.lastMissedOn)
  }

  /** A day checked in or undone: the profile reloads and the toast tells what it earned or gave back. */
  function showDayChange(saved: HabitCheckInResultDto, undoneMessage: string) {
    reloadProfile()
    const change = formatWalletChange(saved.wallet, translate)
    if (saved.done) {
      showToast(change || translate('habits:today.toasts.doneNoReward'), checkInHighlight(saved, translate))
    } else {
      showToast(translate(undoneMessage), change || undefined)
    }
  }

  async function handleToggle(item: HabitTodayItemDto, date: string) {
    try {
      const saved = await habits.toggle(item, date)
      if (saved) showDayChange(saved, 'habits:today.toasts.undone')
    } catch (err) {
      showSaveError(err)
    }
  }

  /** Logs or removes an amount; only the change that completes or undoes the day touches the wallet and is toasted. */
  async function handleProgress(request: Promise<HabitProgressResultDto | undefined>) {
    try {
      const saved = await request
      if (saved?.wallet) showDayChange({ ...saved, wallet: saved.wallet }, 'habits:today.toasts.progressUndone')
    } catch (err) {
      showSaveError(err)
    }
  }

  function dateOf(day: RelapseDay) {
    return day === 'today' ? habits.date! : habits.yesterday
  }

  async function handleRelapse(item: HabitAvoidItemDto, day: RelapseDay) {
    try {
      const saved = await habits.setRelapse(item, dateOf(day), true)
      setRelapseTarget(null)
      if (!saved) return

      reloadProfile()
      // A knockout is told by the layout's moment dialog once the profile reloads.
      showToast(translate('habits:today.toasts.relapsed'), formatWalletChange(saved.wallet, translate) || translate('habits:today.toasts.withinLimit'))
    } catch (err) {
      setRelapseTarget(null)
      showSaveError(err)
    }
  }

  async function handleUndoRelapse(item: HabitAvoidItemDto, day: RelapseDay) {
    try {
      const saved = await habits.setRelapse(item, dateOf(day), false)
      if (!saved) return

      reloadProfile()
      showToast(translate('habits:today.toasts.relapseUndone'), formatWalletChange(saved.wallet, translate) || undefined)
    } catch (err) {
      showSaveError(err)
    }
  }

  /** A failed check-in or relapse: changes made elsewhere just reload; the rest also explain what happened. */
  function showSaveError(err: unknown) {
    if (isSessionExpiredError(err)) return
    if (!isApiError(err)) {
      showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
      return
    }
    if (RELOAD_ONLY_CODES.has(err.code)) {
      habits.reload()
      return
    }

    showErrorModal(translate('habits:today.errors.title'), translate(SAVE_ERROR_MESSAGES[err.code] ?? 'common:errors.generic'))
    habits.reload()
  }

  function renderList(items: HabitTodayItemDto[], date: string, streakRisk?: 'unprotected' | 'protected') {
    return (
      <ul className="lm-today-page__list">
        {items.map((item) => (
          <li key={item.id}>
            {item.target ? (
              <HabitProgressItem
                item={{ ...item, target: item.target }}
                onAdd={(value) => void handleProgress(habits.addProgress(item, date, value))}
                onRemove={(entry: HabitProgressEntryDto) => void handleProgress(habits.removeProgress(item, date, entry))}
                streakRisk={streakRisk}
              />
            ) : (
              <HabitCheckItem
                item={item}
                pending={habits.isPending(item.id, date)}
                onToggle={() => void handleToggle(item, date)}
                streakRisk={streakRisk}
              />
            )}
          </li>
        ))}
      </ul>
    )
  }

  function renderContent() {
    if (habits.status === 'loading') {
      return <p className="lm-today-page__state">{translate('habits:today.loading')}</p>
    }

    if (habits.status === 'error' || !habits.date) {
      return (
        <div className="lm-today-page__state">
          <span>{translate('habits:today.loadError')}</span>
          <Button variant="secondary" size="sm" onClick={habits.reload}>
            {translate('habits:today.retry')}
          </Button>
        </div>
      )
    }

    const hasAvoiding = habits.avoiding.length > 0 || habits.freeToday.length > 0

    if (habits.today.length === 0 && habits.yesterdayPending.length === 0 && !hasAvoiding) {
      return (
        <div className="lm-today-page__empty" data-tour="today.empty">
          <span className="lm-today-page__empty-icon" aria-hidden="true">
            <Icon name="calendar-check" size={24} />
          </span>
          <h2 className="lm-today-page__empty-title">{translate('habits:today.empty.title')}</h2>
          <p className="lm-today-page__empty-message">{translate('habits:today.empty.message')}</p>
          <StarterSuggestions
            title={translate('habits:onboarding.habitsTitle')}
            suggestions={HABIT_TEMPLATES.map((template) => ({
              id: template.id,
              icon: template.icon,
              label: translate(`habits:onboarding.habits.${template.id}.name`),
              detail: translate(`habits:onboarding.habits.${template.id}.trigger`),
            }))}
            onPick={(id) => navigate('/habits/list', { state: { habitTemplate: id } as HabitsPageState })}
          />
          <Button variant="secondary" size="sm" icon="plus" onClick={() => navigate('/habits/list')}>
            {translate('habits:onboarding.ownHabit')}
          </Button>
        </div>
      )
    }

    const progress = todayProgress(habits.today)

    return (
      <>
        {shouldWelcomeBack(habits.lastMissedOn, welcomeDismissedFor) ? <WelcomeBackBanner onDismiss={dismissWelcomeBack} /> : null}

        {habits.yesterdayPending.length > 0 ? (
          <section
            className="lm-today-page__section lm-today-page__section--yesterday"
            aria-labelledby="lm-today-yesterday"
            data-tour="today.yesterday"
          >
            <div className="lm-today-page__section-header">
              <h2 id="lm-today-yesterday" className="lm-today-page__section-title">
                {translate('habits:today.yesterday.title')}
              </h2>
              <span className="lm-today-page__section-hint">{translate('habits:today.yesterday.hint')}</span>
            </div>
            {renderList(habits.yesterdayPending, habits.yesterday, yesterdayRisk)}
          </section>
        ) : null}

        {habits.today.length > 0 || !hasAvoiding ? (
          <section className="lm-today-page__section" aria-labelledby="lm-today-today" data-tour="today.list">
            <div className="lm-today-page__section-header">
              <h2 id="lm-today-today" className="lm-today-page__section-title">
                {translate('habits:today.list.title')}
              </h2>
              {progress.total > 0 ? (
                <span className="lm-today-page__progress">
                  {translate('habits:today.list.progress', { done: progress.done, count: progress.total })}
                </span>
              ) : null}
            </div>

            {progress.allDone ? (
              <p className="lm-today-page__all-done" role="status">
                <Icon name="sparkles" size={16} aria-hidden="true" />
                {translate('habits:today.list.allDone')}
              </p>
            ) : null}

            {progress.total > 0 ? (
              renderList(habits.today, habits.date)
            ) : (
              <p className="lm-today-page__state">{translate('habits:today.list.nothingToday')}</p>
            )}
          </section>
        ) : null}

        {hasAvoiding ? (
          <section className="lm-today-page__section" aria-labelledby="lm-today-avoiding" data-tour="today.avoid">
            <div className="lm-today-page__section-header">
              <h2 id="lm-today-avoiding" className="lm-today-page__section-title">
                {translate('habits:today.avoid.title')}
              </h2>
              <span className="lm-today-page__section-hint">{translate('habits:today.avoid.hint')}</span>
            </div>
            {habits.avoiding.length > 0 ? (
              <ul className="lm-today-page__list">
                {habits.avoiding.map((item) => (
                  <li key={item.id}>
                    <HabitAvoidCard
                      item={item}
                      pending={habits.isPending(item.id, habits.date!) || habits.isPending(item.id, habits.yesterday)}
                      onRelapse={() => setRelapseTarget(item)}
                      onUndo={(day) => void handleUndoRelapse(item, day)}
                    />
                  </li>
                ))}
              </ul>
            ) : null}
            {habits.freeToday.length > 0 ? (
              <p className="lm-today-page__free">
                {translate('habits:today.avoid.freeToday', { names: habits.freeToday.join(', ') })}
              </p>
            ) : null}
          </section>
        ) : null}
      </>
    )
  }

  return (
    <main className="lm-today-page">
      <div className="lm-today-page__heading">
        <span className="lm-today-page__eyebrow">{translate('habits:module.name')}</span>
        <h1 className="lm-today-page__title">{translate('habits:today.title')}</h1>
        {habits.date ? <span className="lm-today-page__date">{formatDayTitle(habits.date, i18n.language)}</span> : null}
      </div>

      {renderContent()}

      {relapseTarget ? (
        <RelapseDialog
          item={relapseTarget}
          onClose={() => setRelapseTarget(null)}
          onConfirm={(day) => handleRelapse(relapseTarget, day)}
        />
      ) : null}
    </main>
  )
}

export default TodayPage
