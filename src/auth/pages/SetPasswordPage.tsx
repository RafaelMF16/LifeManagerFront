import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../shared/hooks/useToast'
import AuthLayout from '../components/AuthLayout/AuthLayout'
import EmailLinkStatus from '../components/EmailLinkStatus/EmailLinkStatus'
import NewPasswordForm from '../components/NewPasswordForm/NewPasswordForm'
import { useEmailToken } from '../hooks/useEmailToken'
import { completeRegistration, verifyRegistration } from '../services/authService'
import type { AuthPageState } from './AuthPage'
import '../components/AuthForm.css'

/**
 * `/auth/set-password?token=…`, opened from the sign-up's confirmation e-mail: the last step of the sign-up. Public
 * without a guard (not under PublicOnlyRoute), so the link works even in a browser signed in to another account.
 */
function SetPasswordPage() {
  const { t: translate } = useTranslation('auth')
  const navigate = useNavigate()
  const { show: showToast } = useToast()
  const { state, retry, markInvalid } = useEmailToken(verifyRegistration)

  return (
    <AuthLayout>
      <div className="lm-auth-card">
        {state.status === 'valid' ? (
          <>
            <div className="lm-auth-form__header">
              <h1 className="lm-auth-form__title">{translate('auth:setPassword.title', { name: state.data.name })}</h1>
              <p className="lm-auth-form__subtitle">{translate('auth:setPassword.subtitle')}</p>
            </div>
            <NewPasswordForm
              email={state.data.email}
              submitLabel={translate('auth:setPassword.submit')}
              onSubmit={async (data) => {
                await completeRegistration(state.token, data)
                showToast(translate('auth:setPassword.successToast'))
                navigate('/auth', { replace: true, state: { mode: 'login' } satisfies AuthPageState })
              }}
              onInvalidLink={markInvalid}
            />
          </>
        ) : (
          <EmailLinkStatus
            state={state.status}
            newLinkLabel={translate('auth:setPassword.backToSignUp')}
            onNewLink={() => navigate('/auth', { replace: true, state: { mode: 'signup' } satisfies AuthPageState })}
            onRetry={retry}
          />
        )}
      </div>
    </AuthLayout>
  )
}

export default SetPasswordPage
