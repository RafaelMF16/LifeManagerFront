import { useTranslation } from 'react-i18next'
import Icon from '../../shared/components/Icon/Icon'
import './TodayPage.css'

/** The Habits home: today's checklist. For now only the empty state; the check-ins arrive with the habits. */
function TodayPage() {
  const { t: translate } = useTranslation('habits')

  return (
    <main className="lm-today-page">
      <div className="lm-today-page__heading">
        <span className="lm-today-page__eyebrow">{translate('habits:module.name')}</span>
        <h1 className="lm-today-page__title">{translate('habits:today.title')}</h1>
      </div>

      <div className="lm-today-page__empty">
        <span className="lm-today-page__empty-icon" aria-hidden="true">
          <Icon name="calendar-check" size={24} />
        </span>
        <h2 className="lm-today-page__empty-title">{translate('habits:today.empty.title')}</h2>
        <p className="lm-today-page__empty-message">{translate('habits:today.empty.message')}</p>
      </div>
    </main>
  )
}

export default TodayPage
