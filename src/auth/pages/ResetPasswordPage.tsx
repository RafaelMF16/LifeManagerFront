import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../shared/hooks/useToast'
import AuthLayout from '../components/AuthLayout/AuthLayout'
import EmailLinkStatus from '../components/EmailLinkStatus/EmailLinkStatus'
import NewPasswordForm from '../components/NewPasswordForm/NewPasswordForm'
import { useEmailToken } from '../hooks/useEmailToken'
import { resetPassword, verifyPasswordReset } from '../services/authService'
import type { AuthPageState } from './AuthPage'
import '../components/AuthForm.css'

/**
 * `/auth/reset-password?token=…`, opened from the password reset e-mail. Public without a guard (not under
 * PublicOnlyRoute), like the set-password page, so the link works in any browser.
 */
function ResetPasswordPage() {
  const { t: translate } = useTranslation('auth')
  const navigate = useNavigate()
  const { show: showToast } = useToast()
  const { state, retry, markInvalid } = useEmailToken(verifyPasswordReset)

  return (
    <AuthLayout>
      <div className="lm-auth-card">
        {state.status === 'valid' ? (
          <>
            <div className="lm-auth-form__header">
              <h1 className="lm-auth-form__title">{translate('auth:resetPassword.title')}</h1>
              <p className="lm-auth-form__subtitle">{translate('auth:resetPassword.subtitle')}</p>
            </div>
            <NewPasswordForm
              email={state.data.email}
              submitLabel={translate('auth:resetPassword.submit')}
              onSubmit={async (data) => {
                await resetPassword(state.token, data)
                showToast(translate('auth:resetPassword.successToast'))
                navigate('/auth', { replace: true, state: { mode: 'login' } satisfies AuthPageState })
              }}
              onInvalidLink={markInvalid}
            />
          </>
        ) : (
          <EmailLinkStatus
            state={state.status}
            newLinkLabel={translate('auth:resetPassword.requestNewLink')}
            onNewLink={() => navigate('/auth/forgot-password', { replace: true })}
            onRetry={retry}
          />
        )}
      </div>
    </AuthLayout>
  )
}

export default ResetPasswordPage
