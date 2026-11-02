import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Icon from '../../../shared/components/Icon/Icon'
import type { ChallengeDto } from '../../types/ChallengeDtos'
import { challengeAmount, challengePace, challengePercent, challengeProgressLabel, challengeReward, effortKey } from '../../utils/challenges'
import './ChallengeCard.css'

interface ChallengeCardProps {
  challenge: ChallengeDto
  /** Offered on an active challenge where it can be given up (the challenges page). */
  onCancel?: (challenge: ChallengeDto) => void
  cancelling?: boolean
}

/** One challenge: the habit and its goal, the bar with the amount and the pace, the effort and what it pays. */
function ChallengeCard({ challenge, onCancel, cancelling = false }: ChallengeCardProps) {
  const { t: translate, i18n } = useTranslation('habits')
  const language = i18n.language
  const progressLabel = challengeProgressLabel(challenge, translate, language)
  const statusClass = `lm-challenge-card--${challenge.status.toLowerCase()}`

  return (
    <article className={`lm-challenge-card ${statusClass}`}>
      <div className="lm-challenge-card__header">
        <span className="lm-challenge-card__icon" aria-hidden="true">
          <Icon name={challenge.status === 'Completed' ? 'trophy' : 'target'} size={18} />
        </span>
        <div className="lm-challenge-card__titles">
          <h3 className="lm-challenge-card__habit">{challenge.habitName}</h3>
          <p className="lm-challenge-card__goal">
            {translate('habits:challenges.card.goal', { amount: challengeAmount(challenge.target, challenge, translate, language) })}
          </p>
        </div>
        <span className={`lm-challenge-card__effort lm-challenge-card__effort--${challenge.effort.toLowerCase()}`}>
          {translate(effortKey(challenge.effort))}
        </span>
      </div>

      <div
        className="lm-challenge-card__bar"
        role="progressbar"
        aria-label={translate('habits:challenges.card.progressAria', { habit: challenge.habitName })}
        aria-valuemin={0}
        aria-valuemax={challenge.target}
        aria-valuenow={Math.min(challenge.progress, challenge.target)}
        aria-valuetext={progressLabel}
      >
        <span className="lm-challenge-card__fill" style={{ width: `${challengePercent(challenge)}%` }} />
      </div>

      <div className="lm-challenge-card__footer">
        <div className="lm-challenge-card__amount">
          <span>{progressLabel}</span>
          <span className="lm-challenge-card__pace">{challengePace(challenge, translate, language)}</span>
        </div>
        <span className="lm-challenge-card__reward">
          <Icon name="coins" size={14} aria-hidden="true" />
          {challengeReward(challenge, translate)}
        </span>
      </div>

      {onCancel && challenge.status === 'Active' ? (
        <div className="lm-challenge-card__actions">
          <Button variant="ghost" size="sm" icon="x" disabled={cancelling} onClick={() => onCancel(challenge)}>
            {translate('habits:challenges.cancel.button')}
          </Button>
        </div>
      ) : null}
    </article>
  )
}

export default ChallengeCard
