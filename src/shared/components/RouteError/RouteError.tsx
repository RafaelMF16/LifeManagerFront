import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouteError } from 'react-router-dom'
import { isChunkLoadError, shouldReloadOnce } from '../../utils/chunkReload'
import Button from '../Button/Button'
import Icon from '../Icon/Icon'
import SplashScreen from '../SplashScreen/SplashScreen'
import './RouteError.css'

/**
 * Whether this error reloads the page, decided once per error: `shouldReloadOnce` writes its mark, so asking again
 * (a second render, React's StrictMode) would answer differently.
 */
const reloadDecisions = new WeakMap<object, boolean>()

function decideReload(error: unknown) {
  if (!isChunkLoadError(error)) return false
  const key = error as object
  let decision = reloadDecisions.get(key)
  if (decision === undefined) {
    try {
      decision = shouldReloadOnce(error, window.sessionStorage)
    } catch {
      decision = false
    }
    reloadDecisions.set(key, decision)
  }
  return decision
}

/**
 * The root route's `errorElement`. A screen whose chunk can't be fetched (a deploy happened while the tab was open)
 * reloads the page once, which brings the new chunks (`shouldReloadOnce`), showing the splash meanwhile. If it fails
 * again, or the error is anything else, a translated message offers to reload.
 */
function RouteError() {
  const error = useRouteError()
  const { t: translate } = useTranslation('common')
  const reload = decideReload(error)

  useEffect(() => {
    if (reload) window.location.reload()
  }, [reload])

  if (reload) return <SplashScreen />

  return (
    <main className="lm-route-error">
      <div className="lm-route-error__card" role="alert">
        <Icon name="refresh-cw" size={28} className="lm-route-error__icon" aria-hidden="true" />
        <h1 className="lm-route-error__title">{translate('common:routeError.title')}</h1>
        <p className="lm-route-error__message">
          {translate(isChunkLoadError(error) ? 'common:routeError.chunkMessage' : 'common:routeError.message')}
        </p>
        <Button icon="refresh-cw" onClick={() => window.location.reload()}>
          {translate('common:routeError.reload')}
        </Button>
      </div>
    </main>
  )
}

export default RouteError
