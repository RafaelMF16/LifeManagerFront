import { useTranslation } from 'react-i18next'
import AnimatedHelm from '../AnimatedHelm/AnimatedHelm'
import './SplashScreen.css'

/**
 * Full-screen "Loading…" with the helm looping, for while the app can't show a screen yet (`ProtectedRoute`
 * restoring the session). It fades in after `--splash-reveal-delay`, so a quick wait never flashes it.
 */
function SplashScreen() {
  const { t: translate } = useTranslation('common')

  return (
    <div className="lm-splash" role="status" aria-live="polite">
      <AnimatedHelm variant="loop" />
      <p className="lm-splash__label">{translate('common:splash.loading')}</p>
    </div>
  )
}

export default SplashScreen
