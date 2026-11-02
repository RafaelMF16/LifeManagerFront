import { useTranslation } from 'react-i18next'
import Icon from '../../../shared/components/Icon/Icon'
import type { WeeklySummaryDto, WeeklySummaryFiguresDto } from '../../types/ChallengeDtos'
import { challengePace, challengeProgressLabel, summaryPlace } from '../../utils/challenges'
import { summaryChange } from '../../utils/gameMoments'
import { formatWeekRange, medal } from '../../utils/ranking'
import './WeeklySummary.css'

interface WeeklySummaryProps {
  summary: WeeklySummaryDto
  titleId: string
  /** Opens a group's ranking (closing the summary). */
  onOpenGroup?: (groupId: number) => void
}

const FIGURES: (keyof WeeklySummaryFiguresDto)[] = ['checkIns', 'cleanDays', 'coins', 'challengesCompleted']

/**
 * The weekly summary's body: last week's figures next to the week before, how each challenge ended and the player's
 * place in each ranking group (provisional until the week closes).
 */
function WeeklySummary({ summary, titleId, onOpenGroup }: WeeklySummaryProps) {
  const { t: translate, i18n } = useTranslation('habits')
  // A figure that was zero both weeks (clean days without habits to avoid, say) says nothing.
  const figures = FIGURES.filter((figure) => summary.week[figure] > 0 || summary.previousWeek[figure] > 0)

  return (
    <div className="lm-game-moment lm-game-moment--summary">
      <span className="lm-game-moment__icon" aria-hidden="true">
        <Icon name="calendar-check" size={32} />
      </span>
      <h2 id={titleId} className="lm-game-moment__title">
        {translate('habits:moments.summary.title')}
      </h2>
      <p className="lm-game-moment__message">{formatWeekRange(summary.weekStart, summary.weekEnd, i18n.language)}</p>

      {figures.length > 0 ? (
        <dl className="lm-weekly-summary__figures">
          {figures.map((figure) => {
            const change = summaryChange(summary.week[figure], summary.previousWeek[figure])
            return (
              <div key={figure} className="lm-weekly-summary__figure">
                <dt>{translate(`habits:moments.summary.figures.${figure}`)}</dt>
                <dd>
                  <span className="lm-weekly-summary__value">{summary.week[figure]}</span>
                  <span
                    className={`lm-weekly-summary__change lm-weekly-summary__change--${change === '=' ? 'same' : change.startsWith('+') ? 'up' : 'down'}`}
                    aria-label={translate('habits:moments.summary.changeAria', { change, previous: summary.previousWeek[figure] })}
                  >
                    {change}
                  </span>
                </dd>
              </div>
            )
          })}
        </dl>
      ) : null}

      {summary.challenges.length > 0 ? (
        <ul className="lm-game-moment__list lm-weekly-summary__challenges" aria-label={translate('habits:moments.summary.challenges')}>
          {summary.challenges.map((challenge) => (
            <li
              key={challenge.id}
              className={`lm-game-moment__item lm-game-moment__item--${challenge.status === 'Completed' ? 'completed' : 'missed'}`}
            >
              <Icon name={challenge.status === 'Completed' ? 'check' : challenge.status === 'Failed' ? 'x' : 'target'} size={16} aria-hidden="true" />
              <span>
                {challenge.habitName} · {challengeProgressLabel(challenge, translate, i18n.language)}
              </span>
              <span className="lm-game-moment__item-tier">{challengePace(challenge, translate, i18n.language)}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {summary.ranking.length > 0 ? (
        <section className="lm-weekly-summary__ranking" aria-labelledby={`${titleId}-ranking`}>
          <h3 id={`${titleId}-ranking`} className="lm-weekly-summary__section-title">
            {translate('habits:moments.summary.ranking')}
          </h3>
          <ul className="lm-weekly-summary__places">
            {summary.ranking.map((place) => (
              <li key={place.groupId}>
                <button type="button" className="lm-weekly-summary__place" onClick={() => onOpenGroup?.(place.groupId)}>
                  <span className="lm-weekly-summary__medal" aria-hidden="true">
                    {medal(place.position) ?? ''}
                  </span>
                  <span className="lm-weekly-summary__group">{place.groupName}</span>
                  <span className="lm-weekly-summary__standing">{summaryPlace(place, translate)}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="lm-game-moment__message">{translate('habits:moments.summary.message')}</p>
    </div>
  )
}

export default WeeklySummary
