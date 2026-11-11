import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import Button from '../../../shared/components/Button/Button'
import type { HomeOverviewStatus } from '../../hooks/useHomeOverview'
import type { HomeOverviewDto } from '../../types/HomeOverview'
import { habitsCardState } from '../../utils/overviewCopy'
import HomeCard from '../HomeCard/HomeCard'
import './HabitsTodayCard.css'

interface HabitsTodayCardProps {
  overview: HomeOverviewDto | null
  status: HomeOverviewStatus
  onRetry: () => void
}

/** The Home's habits card: today's progress, yesterday still pending, the best streak, relapses and the player. */
function HabitsTodayCard({ overview, status, onRetry }: HabitsTodayCardProps) {
  const { t: translate } = useTranslation('home')
  const navigate = useNavigate()
  const state = overview ? habitsCardState(overview.habits, overview.player) : null
  const player = overview?.player ?? null

  const actions =
    state?.kind === 'new' ? (
      <Button icon="plus" onClick={() => navigate('/habits/list')}>
        {translate('habits.new.action')}
      </Button>
    ) : (
      <Button variant="secondary" iconRight="chevron-right" onClick={() => navigate('/habits/today')}>
        {translate('habits.goToToday')}
      </Button>
    )

  return (
    <HomeCard
      id="habits"
      icon="calendar-check"
      title={translate('habits.title')}
      status={status}
      loadingLabel={translate('habits.loading')}
      onRetry={onRetry}
      actions={actions}
      tourTarget="home.habits"
    >
      {state?.kind === 'new' ? (
        <>
          <p className="lm-home-card__line lm-home-card__line--strong">{translate('habits.new.title')}</p>
          <p className="lm-home-card__line">{translate('habits.new.body')}</p>
        </>
      ) : state?.kind === 'nothingToday' ? (
        <p className="lm-home-card__line">{translate('habits.nothingToday')}</p>
      ) : state?.kind === 'summary' ? (
        <>
          {state.progress ? (
            <div className="lm-habits-today-card__progress">
              <p className="lm-home-card__line lm-home-card__line--strong">
                {translate('habits.progress', { done: state.progress.done, count: state.progress.due })}
              </p>
              <div
                className="lm-home-card__bar"
                role="progressbar"
                aria-label={translate('habits.progressLabel')}
                aria-valuemin={0}
                aria-valuemax={state.progress.due}
                aria-valuenow={state.progress.done}
              >
                <div className="lm-home-card__bar-fill" style={{ width: `${Math.round(state.progress.ratio * 100)}%` }} />
              </div>
            </div>
          ) : (
            <p className="lm-home-card__line lm-home-card__line--strong">{translate('habits.onlyAvoiding')}</p>
          )}

          {state.yesterdayPending > 0 ? (
            <p className="lm-home-card__line lm-habits-today-card__pending">
              {translate('habits.yesterdayPending', { count: state.yesterdayPending })}
            </p>
          ) : null}

          {state.bestStreak ? (
            <p className="lm-home-card__line lm-habits-today-card__streak">
              {translate('habits.bestStreak', { name: state.bestStreak.name, count: state.bestStreak.days })}
            </p>
          ) : null}

          {state.relapsedToday > 0 ? (
            <p className="lm-home-card__line lm-habits-today-card__relapses">
              {translate('habits.relapses', { count: state.relapsedToday })}
            </p>
          ) : null}
        </>
      ) : null}

      {player ? (
        <p className="lm-habits-today-card__player">
          <span>{translate('habits.player.level', { level: player.level })}</span>
          <span>{translate('habits.player.hp', { hp: player.hp, maxHp: player.maxHp })}</span>
          <span>{translate('habits.player.coins', { count: player.coins })}</span>
        </p>
      ) : null}
    </HomeCard>
  )
}

export default HabitsTodayCard
