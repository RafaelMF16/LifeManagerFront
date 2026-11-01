import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import type { ChallengeSuggestionDto } from '../../types/ChallengeDtos'
import { challengeAmount, challengeReward, effortKey } from '../../utils/challenges'
import './ChallengeSuggestionList.css'

interface ChallengeSuggestionListProps {
  suggestions: ChallengeSuggestionDto[]
  /** The habit whose suggestion is being created, so its button waits and the others don't double up. */
  pendingHabitId: number | null
  onAccept: (suggestion: ChallengeSuggestionDto) => void
}

/** The backend's suggestions, a bit above the player's usual week: accepting one creates exactly that challenge. */
function ChallengeSuggestionList({ suggestions, pendingHabitId, onAccept }: ChallengeSuggestionListProps) {
  const { t: translate, i18n } = useTranslation('habits')

  return (
    <section className="lm-challenge-suggestions" aria-labelledby="lm-challenge-suggestions-title" data-tour="challenges.suggestions">
      <h3 id="lm-challenge-suggestions-title" className="lm-challenge-suggestions__title">
        {translate('habits:challenges.suggestions.title')}
      </h3>
      <ul className="lm-challenge-suggestions__list">
        {suggestions.map((suggestion) => (
          <li key={suggestion.habitId} className="lm-challenge-suggestions__item">
            <div className="lm-challenge-suggestions__text">
              <span className="lm-challenge-suggestions__habit">{suggestion.habitName}</span>
              <span className="lm-challenge-suggestions__goal">
                {translate('habits:challenges.suggestions.goal', {
                  amount: challengeAmount(suggestion.target, suggestion, translate, i18n.language),
                  usual: challengeAmount(Math.round(suggestion.baseline), suggestion, translate, i18n.language),
                })}
              </span>
              <span className="lm-challenge-suggestions__reward">
                {translate(effortKey(suggestion.effort))} · {challengeReward(suggestion, translate)}
              </span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon="check"
              loading={pendingHabitId === suggestion.habitId}
              disabled={pendingHabitId !== null && pendingHabitId !== suggestion.habitId}
              onClick={() => onAccept(suggestion)}
            >
              {translate('habits:challenges.suggestions.accept')}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default ChallengeSuggestionList
