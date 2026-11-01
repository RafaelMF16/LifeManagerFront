import { useTranslation } from 'react-i18next'
import type { WeeklyScoreDayDto } from '../../types/RankingDtos'
import { formatWeekday } from '../../utils/ranking'
import './RankingMyWeek.css'

interface RankingMyWeekProps {
  days: WeeklyScoreDayDto[]
  points: number
  /** The weekly challenges' bonus, already in `points`. */
  challengePoints: number
}

// Espelha LifeManager.Domain/Ranking/RankingRules.MaxKeptHabitsPerDay.
const MAX_KEPT_PER_DAY = 5

/**
 * My points day by day (Monday to Sunday): kept habits out of 5, ⭐ on a perfect day, the challenges' bonus when there
 * is one, and how the points work.
 */
function RankingMyWeek({ days, points, challengePoints }: RankingMyWeekProps) {
  const { t: translate, i18n } = useTranslation('habits')

  return (
    <section className="lm-ranking-week" aria-labelledby="lm-ranking-week-title" data-tour="ranking.myWeek">
      <div className="lm-ranking-week__heading">
        <h2 id="lm-ranking-week-title" className="lm-ranking-week__title">
          {translate('habits:ranking.myWeek.title')}
        </h2>
        <span className="lm-ranking-week__total">{translate('habits:ranking.board.points', { count: points })}</span>
      </div>

      <ol className="lm-ranking-week__days">
        {days.map((day) => (
          <li
            key={day.date}
            className={`lm-ranking-week__day${day.perfect ? ' lm-ranking-week__day--perfect' : ''}`}
            aria-label={translate('habits:ranking.myWeek.dayAria', {
              day: formatWeekday(day.date, i18n.language),
              kept: day.kept,
              points: day.points,
              context: day.perfect ? 'perfect' : undefined,
            })}
          >
            <span className="lm-ranking-week__weekday" aria-hidden="true">
              {formatWeekday(day.date, i18n.language)}
            </span>
            <span className="lm-ranking-week__kept" aria-hidden="true">
              {day.kept}/{MAX_KEPT_PER_DAY}
            </span>
            <span className="lm-ranking-week__points" aria-hidden="true">
              {day.perfect ? '⭐ ' : ''}
              {day.points}
            </span>
          </li>
        ))}
      </ol>

      {challengePoints > 0 ? (
        <p className="lm-ranking-week__challenges">{translate('habits:ranking.myWeek.challenges', { points: challengePoints })}</p>
      ) : null}

      <details className="lm-ranking-week__how">
        <summary>{translate('habits:ranking.myWeek.howTitle')}</summary>
        <ul>
          <li>{translate('habits:ranking.myWeek.howKept')}</li>
          <li>{translate('habits:ranking.myWeek.howPerfect')}</li>
          <li>{translate('habits:ranking.myWeek.howChallenges')}</li>
          <li>{translate('habits:ranking.myWeek.howDelay')}</li>
          <li>{translate('habits:ranking.myWeek.howTie')}</li>
        </ul>
      </details>
    </section>
  )
}

export default RankingMyWeek
