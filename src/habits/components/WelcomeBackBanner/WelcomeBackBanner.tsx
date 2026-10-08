import { useTranslation } from 'react-i18next'
import Icon from '../../../shared/components/Icon/Icon'
import IconButton from '../../../shared/components/IconButton/IconButton'
import './WelcomeBackBanner.css'

interface WelcomeBackBannerProps {
  onDismiss: () => void
}

/**
 * Shown after a missed day. A broken streak is when people tend to give up altogether ("I already blew it"), so this
 * says the opposite: one miss doesn't erase the progress, consistency does the work.
 */
function WelcomeBackBanner({ onDismiss }: WelcomeBackBannerProps) {
  const { t: translate } = useTranslation('habits')

  return (
    <section className="lm-welcome-back" aria-labelledby="lm-welcome-back-title">
      <span className="lm-welcome-back__icon" aria-hidden="true">
        <Icon name="heart" size={18} />
      </span>
      <div className="lm-welcome-back__text">
        <h2 id="lm-welcome-back-title" className="lm-welcome-back__title">
          {translate('habits:today.welcomeBack.title')}
        </h2>
        <p className="lm-welcome-back__message">{translate('habits:today.welcomeBack.message')}</p>
      </div>
      <IconButton icon="x" size="sm" label={translate('habits:today.welcomeBack.dismiss')} onClick={onDismiss} />
    </section>
  )
}

export default WelcomeBackBanner
