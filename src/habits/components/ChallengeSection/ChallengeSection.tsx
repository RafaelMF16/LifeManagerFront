import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { ChallengeDto } from '../../types/ChallengeDtos'
import ChallengeCard from '../ChallengeCard/ChallengeCard'
import './ChallengeSection.css'

interface ChallengeSectionProps {
  challenges: ChallengeDto[]
}

/** "Desafios da semana" on Today: the week's challenges as read-only cards, and the way to plan them. */
function ChallengeSection({ challenges }: ChallengeSectionProps) {
  const { t: translate } = useTranslation('habits')

  return (
    <section className="lm-challenge-section" aria-labelledby="lm-challenge-section-title" data-tour="today.challenges">
      <div className="lm-challenge-section__header">
        <h2 id="lm-challenge-section-title" className="lm-challenge-section__title">
          {translate('habits:challenges.section.title')}
        </h2>
        <Link className="lm-challenge-section__link" to="/habits/challenges">
          {translate(challenges.length > 0 ? 'habits:challenges.section.manage' : 'habits:challenges.section.plan')}
        </Link>
      </div>

      {challenges.length > 0 ? (
        <ul className="lm-challenge-section__list">
          {challenges.map((challenge) => (
            <li key={challenge.id}>
              <ChallengeCard challenge={challenge} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="lm-challenge-section__empty">{translate('habits:challenges.section.empty')}</p>
      )}
    </section>
  )
}

export default ChallengeSection
