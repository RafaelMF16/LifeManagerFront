import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useOutletContext } from 'react-router-dom'
import Button from '../../shared/components/Button/Button'
import Icon from '../../shared/components/Icon/Icon'
import { useErrorModal } from '../../shared/hooks/useErrorModal'
import { useToast } from '../../shared/hooks/useToast'
import { isSessionExpiredError } from '../../shared/services/httpClient'
import { isApiError } from '../../shared/types/ApiError'
import HabitCheckItem from '../components/HabitCheckItem/HabitCheckItem'
import WelcomeBackBanner from '../components/WelcomeBackBanner/WelcomeBackBanner'
import { useHabitsToday } from '../hooks/useHabitsToday'
import type { HabitsOutletContext } from '../types/HabitsOutletContext'
import type { HabitTodayItemDto } from '../types/HabitTodayDtos'
import { checkInHighlight, formatDayTitle, formatWalletChange, todayProgress } from '../utils/todayProgress'
import { readWelcomeBackDismissed, shouldWelcomeBack, writeWelcomeBackDismissed } from '../utils/welcomeBack'
import {
  HABIT_ALREADY_CHECKED_IN_CODE,
  HABIT_ARCHIVED_CODE,
  HABIT_CHECK_IN_NOT_FOUND_CODE,
  HABIT_CHECK_IN_OUTSIDE_WINDOW_CODE,
  HABIT_NOT_FOUND_CODE,
} from '../validation/habitErrorMap'
import './TodayPage.css'

/** The Habits home: today's checklist, with yesterday's leftovers on top while they can still be checked in. */
function TodayPage() {
  const { t: translate, i18n } = useTranslation(['habits', 'common'])
  const navigate = useNavigate()
  const { profile, reloadProfile } = useOutletContext<HabitsOutletContext>()
  const { show: showToast } = useToast()
  const { show: showErrorModal } = useErrorModal()
  const habits = useHabitsToday()
  const [welcomeDismissedFor, setWelcomeDismissedFor] = useState(readWelcomeBackDismissed)

  // A streak freeze would cover yesterday if it's left unchecked: the warning says so instead of alarming.
  const yesterdayRisk = (profile?.streakFreezes ?? 0) > 0 ? 'protected' : 'unprotected'

  function dismissWelcomeBack() {
    if (!habits.lastMissedOn) return
    writeWelcomeBackDismissed(habits.lastMissedOn)
    setWelcomeDismissedFor(habits.lastMissedOn)
  }

  async function handleToggle(item: HabitTodayItemDto, date: string) {
    try {
      const saved = await habits.toggle(item, date)
      if (!saved) return

      reloadProfile()
      const change = formatWalletChange(saved.wallet, translate)
      if (saved.done) {
        showToast(change || translate('habits:today.toasts.doneNoReward'), checkInHighlight(saved, translate))
      } else {
        showToast(translate('habits:today.toasts.undone'), change || undefined)
      }
    } catch (err) {
      if (isSessionExpiredError(err)) return
      if (!isApiError(err)) {
        showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
        return
      }
      // Changed in another tab or device: the reloaded list already shows it as it is.
      if (err.code === HABIT_ALREADY_CHECKED_IN_CODE || err.code === HABIT_CHECK_IN_NOT_FOUND_CODE) {
        habits.reload()
        return
      }

      const message =
        err.code === HABIT_CHECK_IN_OUTSIDE_WINDOW_CODE
          ? 'habits:today.errors.outsideWindow'
          : err.code === HABIT_NOT_FOUND_CODE || err.code === HABIT_ARCHIVED_CODE
            ? 'habits:today.errors.gone'
            : 'common:errors.generic'
      showErrorModal(translate('habits:today.errors.title'), translate(message))
      habits.reload()
    }
  }

  function renderList(items: HabitTodayItemDto[], date: string, streakRisk?: 'unprotected' | 'protected') {
    return (
      <ul className="lm-today-page__list">
        {items.map((item) => (
          <li key={item.id}>
            <HabitCheckItem
              item={item}
              pending={habits.isPending(item.id, date)}
              onToggle={() => void handleToggle(item, date)}
              streakRisk={streakRisk}
            />
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

    if (habits.today.length === 0 && habits.yesterdayPending.length === 0) {
      return (
        <div className="lm-today-page__empty">
          <span className="lm-today-page__empty-icon" aria-hidden="true">
            <Icon name="calendar-check" size={24} />
          </span>
          <h2 className="lm-today-page__empty-title">{translate('habits:today.empty.title')}</h2>
          <p className="lm-today-page__empty-message">{translate('habits:today.empty.message')}</p>
          <Button variant="primary" size="sm" icon="plus" onClick={() => navigate('/habits/list')}>
            {translate('habits:today.empty.action')}
          </Button>
        </div>
      )
    }

    const progress = todayProgress(habits.today)

    return (
      <>
        {shouldWelcomeBack(habits.lastMissedOn, welcomeDismissedFor) ? <WelcomeBackBanner onDismiss={dismissWelcomeBack} /> : null}

        {habits.yesterdayPending.length > 0 ? (
          <section className="lm-today-page__section lm-today-page__section--yesterday" aria-labelledby="lm-today-yesterday">
            <div className="lm-today-page__section-header">
              <h2 id="lm-today-yesterday" className="lm-today-page__section-title">
                {translate('habits:today.yesterday.title')}
              </h2>
              <span className="lm-today-page__section-hint">{translate('habits:today.yesterday.hint')}</span>
            </div>
            {renderList(habits.yesterdayPending, habits.yesterday, yesterdayRisk)}
          </section>
        ) : null}

        <section className="lm-today-page__section" aria-labelledby="lm-today-today">
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
    </main>
  )
}

export default TodayPage
