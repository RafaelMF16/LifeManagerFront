import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import Button from '../../../shared/components/Button/Button'
import { useErrorModal } from '../../../shared/hooks/useErrorModal'
import { useToast } from '../../../shared/hooks/useToast'
import { logoutAll } from '../../../shared/services/authSession'
import { isSessionExpiredError } from '../../../shared/services/httpClient'
import AccountSection from '../AccountSection/AccountSection'
import ChangePasswordDialog from '../ChangePasswordDialog/ChangePasswordDialog'
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog'

type OpenDialog = 'password' | 'logoutAll' | null

/** Change the password; sign out of every device. */
function SecuritySection() {
  const { t: translate } = useTranslation(['account', 'common'])
  const navigate = useNavigate()
  const { show: showToast } = useToast()
  const { show: showErrorModal } = useErrorModal()
  const [open, setOpen] = useState<OpenDialog>(null)

  async function signOutEverywhere() {
    try {
      await logoutAll()
    } catch (err) {
      if (!isSessionExpiredError(err)) {
        showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
      }
      return
    }

    showToast(translate('account:security.sessions.success'))
    // `replace` so the browser's back button doesn't return to an authenticated screen.
    navigate('/auth', { replace: true })
  }

  return (
    <AccountSection title={translate('account:security.title')} icon="shield-check" tourTarget="account.security">
      <div className="lm-account-row">
        <div className="lm-account-row__text">
          <p className="lm-account-row__value">{translate('account:security.password.label')}</p>
          <p className="lm-account-row__hint">{translate('account:security.password.description')}</p>
        </div>
        <Button variant="secondary" size="sm" icon="lock" onClick={() => setOpen('password')}>
          {translate('account:security.password.action')}
        </Button>
      </div>

      <div className="lm-account-row">
        <div className="lm-account-row__text">
          <p className="lm-account-row__value">{translate('account:security.sessions.label')}</p>
          <p className="lm-account-row__hint">{translate('account:security.sessions.description')}</p>
        </div>
        <Button variant="secondary" size="sm" icon="log-out" onClick={() => setOpen('logoutAll')}>
          {translate('account:security.sessions.action')}
        </Button>
      </div>

      {open === 'password' ? <ChangePasswordDialog onClose={() => setOpen(null)} /> : null}
      {open === 'logoutAll' ? (
        <ConfirmDialog
          title={translate('account:security.sessions.confirmTitle')}
          message={translate('account:security.sessions.confirmMessage')}
          confirmLabel={translate('account:security.sessions.confirm')}
          confirmIcon="log-out"
          onClose={() => setOpen(null)}
          onConfirm={signOutEverywhere}
        />
      ) : null}
    </AccountSection>
  )
}

export default SecuritySection
