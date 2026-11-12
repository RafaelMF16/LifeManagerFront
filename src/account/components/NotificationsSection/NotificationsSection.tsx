import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import InstallAppDialog from '../../../shared/components/InstallAppDialog/InstallAppDialog'
import { useErrorModal } from '../../../shared/hooks/useErrorModal'
import { useToast } from '../../../shared/hooks/useToast'
import { isSessionExpiredError } from '../../../shared/services/httpClient'
import { usePushNotifications } from '../../hooks/usePushNotifications'
import AccountSection from '../AccountSection/AccountSection'

/**
 * "Notifications": turns the habit reminders on or off **on this device** (each browser or installed app subscribes
 * on its own). The hour of each reminder is chosen on the habit's form. The permission is only asked from the
 * "Turn on" click, never when the page opens.
 */
function NotificationsSection() {
  const { t: translate } = useTranslation(['account', 'common'])
  const { show: showToast } = useToast()
  const { show: showErrorModal } = useErrorModal()
  const { state, subscribed, busy, enable, disable } = usePushNotifications()
  const [installStepsOpen, setInstallStepsOpen] = useState(false)

  function showError(err: unknown) {
    if (isSessionExpiredError(err)) return
    showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
  }

  async function turnOn() {
    try {
      const permission = await enable()
      if (permission === 'granted') showToast(translate('account:notifications.enabledToast'))
    } catch (err) {
      showError(err)
    }
  }

  async function turnOff() {
    try {
      await disable()
      showToast(translate('account:notifications.disabledToast'))
    } catch (err) {
      showError(err)
    }
  }

  function renderAction() {
    if (state === 'off' || state === null) {
      return (
        <Button variant="primary" size="sm" icon="bell" loading={busy} disabled={state === null} onClick={() => void turnOn()}>
          {translate('account:notifications.enable')}
        </Button>
      )
    }
    // Blocked after turning them on: the subscription is still here and on the server, so it can still be removed.
    if (state === 'on' || (state === 'denied' && subscribed)) {
      return (
        <Button variant="secondary" size="sm" loading={busy} onClick={() => void turnOff()}>
          {translate('account:notifications.disable')}
        </Button>
      )
    }
    if (state === 'ios-install') {
      return (
        <Button variant="secondary" size="sm" icon="square-plus" onClick={() => setInstallStepsOpen(true)}>
          {translate('account:notifications.howToInstall')}
        </Button>
      )
    }
    return null
  }

  return (
    <AccountSection title={translate('account:notifications.title')} icon="bell" tourTarget="account.notifications">
      <div className="lm-account-row">
        <div className="lm-account-row__text">
          <p className="lm-account-row__value">{translate('account:notifications.label')}</p>
          <p className="lm-account-row__hint" aria-live="polite">
            {translate(`account:notifications.states.${state ?? 'loading'}`)}
          </p>
        </div>
        {renderAction()}
      </div>

      {installStepsOpen ? <InstallAppDialog onClose={() => setInstallStepsOpen(false)} /> : null}
    </AccountSection>
  )
}

export default NotificationsSection
