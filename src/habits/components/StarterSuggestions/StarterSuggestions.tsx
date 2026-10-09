import Icon from '../../../shared/components/Icon/Icon'
import type { IconName } from '../../../shared/components/Icon/Icon'
import './StarterSuggestions.css'

interface Suggestion {
  id: string
  icon: IconName
  label: string
  /** A second line, e.g. the cue or the price. */
  detail?: string
}

interface StarterSuggestionsProps {
  title: string
  suggestions: Suggestion[]
  /** Opens the form filled with that suggestion; nothing is created until the player saves it. */
  onPick: (id: string) => void
}

/** A few ready-made starting points for an empty list, each one tap away from a filled form. */
function StarterSuggestions({ title, suggestions, onPick }: StarterSuggestionsProps) {
  return (
    <div className="lm-starter">
      <span className="lm-starter__title">{title}</span>
      <ul className="lm-starter__list">
        {suggestions.map((suggestion) => (
          <li key={suggestion.id}>
            <button type="button" className="lm-starter__item" onClick={() => onPick(suggestion.id)}>
              <span className="lm-starter__icon" aria-hidden="true">
                <Icon name={suggestion.icon} size={16} />
              </span>
              <span className="lm-starter__text">
                <span className="lm-starter__label">{suggestion.label}</span>
                {suggestion.detail ? <span className="lm-starter__detail">{suggestion.detail}</span> : null}
              </span>
              <Icon name="plus" size={16} aria-hidden="true" className="lm-starter__add" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default StarterSuggestions
