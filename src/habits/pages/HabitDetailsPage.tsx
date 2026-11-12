import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../../shared/components/Button/Button'
import Icon from '../../shared/components/Icon/Icon'
import Skeleton from '../../shared/components/Skeleton/Skeleton'
import SkeletonGroup from '../../shared/components/Skeleton/SkeletonGroup'
import HabitHeatmap from '../components/HabitHeatmap/HabitHeatmap'
import HabitStatsSummary from '../components/HabitStatsSummary/HabitStatsSummary'
import LedgerList from '../components/LedgerList/LedgerList'
import { useHabitStats } from '../hooks/useHabitStats'
import { useLedger } from '../hooks/useLedger'
import { formatFrequency } from '../utils/formatFrequency'
import { formatReminderHour } from '../utils/reminderHour'
import { formatAmount } from '../utils/habitProgress'
import './HabitDetailsPage.css'

const SKELETON_TILES = [0, 1, 2]

/** The habit's first load: heading, stat tiles and the heatmap card, in the page's own layout classes. */
function HabitDetailsSkeleton({ backLink, label }: { backLink: ReactNode; label: string }) {
  return (
    <main className="lm-habit-details">
      <div className="lm-habit-details__heading">
        {backLink}
        <div className="lm-habit-details__title-row">
          <Skeleton width={200} height={26} />
        </div>
        <div className="lm-habit-details__meta">
          <Skeleton shape="block" width={56} height={18} />
          <Skeleton shape="block" width={48} height={18} />
          <Skeleton width={96} />
        </div>
      </div>
      <SkeletonGroup label={label} className="lm-habit-stats">
        {SKELETON_TILES.map((tile) => (
          <div key={tile} className="lm-habit-stats__tile">
            <Skeleton width={72} />
            <Skeleton width="50%" height={24} />
            <Skeleton width="70%" />
          </div>
        ))}
      </SkeletonGroup>
      <div className="lm-habit-details__card">
        <div className="lm-habit-details__card-header">
          <Skeleton width={140} height={18} />
        </div>
        <Skeleton shape="block" height={140} />
      </div>
    </main>
  )
}

const LEDGER_PAGE_SIZE = 10

/** One habit's history: streak, consistency, the way to 66 days, the last 13 weeks and its statement lines. */
function HabitDetailsPage() {
  const { t: translate, i18n } = useTranslation('habits')
  const navigate = useNavigate()
  const { habitId: habitIdParam } = useParams()
  const habitId = Number(habitIdParam)
  const validId = Number.isInteger(habitId) && habitId > 0
  const stats = useHabitStats(habitId)
  const ledger = useLedger(LEDGER_PAGE_SIZE, habitId)

  const backLink = (
    <Link to="/habits/list" className="lm-habit-details__back">
      <Icon name="chevron-left" size={14} aria-hidden="true" />
      {translate('habits:details.back')}
    </Link>
  )

  if (stats.status === 'notFound' || !validId) {
    return (
      <main className="lm-habit-details">
        {backLink}
        <div className="lm-habit-details__state">
          <span>{translate('habits:details.notFound')}</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/habits/list')}>
            {translate('habits:details.backToHabits')}
          </Button>
        </div>
      </main>
    )
  }

  const data = stats.data

  if (!data && stats.status !== 'error') {
    return <HabitDetailsSkeleton backLink={backLink} label={translate('habits:details.loading')} />
  }

  if (!data) {
    return (
      <main className="lm-habit-details">
        {backLink}
        <div className="lm-habit-details__state">
          <span>{translate('habits:details.loadError')}</span>
          <Button variant="secondary" size="sm" onClick={stats.reload}>
            {translate('habits:history.retry')}
          </Button>
        </div>
      </main>
    )
  }

  const { habit } = data
  const target = habit.targetValue != null && habit.targetUnit ? { value: habit.targetValue, unit: habit.targetUnit } : null

  return (
    <main className="lm-habit-details">
      <div className="lm-habit-details__heading">
        {backLink}
        <div className="lm-habit-details__title-row">
          <h1 className="lm-habit-details__title">{habit.name}</h1>
          {habit.archivedAt ? <span className="lm-habit-details__badge">{translate('habits:details.archived')}</span> : null}
        </div>
        <div className="lm-habit-details__meta">
          <span className={`lm-habit-details__badge lm-habit-details__badge--${habit.kind.toLowerCase()}`}>
            {translate(`habits:habits.list.kind.${habit.kind}`)}
          </span>
          <span className="lm-habit-details__badge">{translate(`habits:habits.list.difficulty.${habit.difficulty}`)}</span>
          <span className="lm-habit-details__frequency">{formatFrequency(habit, translate, i18n.language)}</span>
          {habit.reminderHour != null ? (
            <span className="lm-habit-details__reminder">
              <Icon name="bell" size={12} aria-hidden="true" />
              {translate('habits:habits.form.reminderAt', { hour: formatReminderHour(habit.reminderHour, i18n.language) })}
            </span>
          ) : null}
        </div>
        {target ? (
          <p className="lm-habit-details__target">
            {translate('habits:details.target', { value: formatAmount(target.value, i18n.language), unit: target.unit })}
          </p>
        ) : null}
        {habit.trigger ? <p className="lm-habit-details__trigger">{habit.trigger}</p> : null}
      </div>

      <HabitStatsSummary stats={data} />

      <section className="lm-habit-details__card" aria-labelledby="habit-heatmap-title" data-tour="details.heatmap">
        <div className="lm-habit-details__card-header">
          <h2 id="habit-heatmap-title" className="lm-habit-details__card-title">
            {translate('habits:details.heatmap.title')}
          </h2>
          <span className="lm-habit-details__card-hint">{translate('habits:details.heatmap.hint')}</span>
        </div>
        <HabitHeatmap days={data.days} kind={habit.kind} target={target} />
      </section>

      <LedgerList
        data={ledger.data}
        status={ledger.status}
        isFetching={ledger.isFetching}
        onPageChange={ledger.setPage}
        onRetry={ledger.reload}
        title={translate('habits:details.ledgerTitle')}
        emptyMessage={translate('habits:details.ledgerEmpty')}
      />
    </main>
  )
}

export default HabitDetailsPage
