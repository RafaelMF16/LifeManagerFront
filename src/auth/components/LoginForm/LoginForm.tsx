import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { Location } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Input from '../../../shared/components/Input/Input'
import { useZodForm } from '../../../shared/hooks/useZodForm'
import { useToast } from '../../../shared/hooks/useToast'
import { useErrorModal } from '../../../shared/hooks/useErrorModal'
import { useLoginTransition } from '../../../shared/hooks/useLoginTransition'
import { applyApiErrorToForm } from '../../../shared/utils/applyApiErrorToForm'
import { isApiError } from '../../../shared/types/ApiError'
import { loadAndApplyUserPreferences } from '../../../shared/services/userPreferencesService'
import { login } from '../../services/authService'
import { loginErrorFieldMap, loginFallbackMessage } from '../../validation/userErrorMap'
import { loginSchema } from '../../validation/userSchemas'
import { enterStyle } from '../../../shared/utils/enterStyle'
import '../AuthForm.css'

interface LoginFormProps {
  onSwitchToSignup: () => void
}

function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const { t: translate } = useTranslation(['auth', 'common'])
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useZodForm(loginSchema)
  const { show: showToast } = useToast()
  const { show: showErrorModal } = useErrorModal()
  const { play: playLoginTransition } = useLoginTransition()
  const navigate = useNavigate()
  const location = useLocation()

  const onSubmit = handleSubmit(async (data) => {
    let deletionCancelled = false
    try {
      deletionCancelled = (await login(data)).deletionCancelled
    } catch (err) {
      if (isApiError(err)) {
        applyApiErrorToForm(err, setError, loginErrorFieldMap, translate, loginFallbackMessage)
      } else {
        showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
      }
      return
    }

    // A failure here must not block the login: the locally stored preferences stay applied.
    await loadAndApplyUserPreferences().catch(() => {})
    // Back to the screen ProtectedRoute bounced the user from; `replace` so "back" doesn't return to /auth.
    const from = (location.state as { from?: Location } | null)?.from
    const target = from ? `${from.pathname}${from.search}` : '/home'
    // After the preferences, so the cover already has the user's theme. The navigation runs under the cover, which
    // then opens over the new screen. The helm animation is the success feedback; the toast only stands in for it
    // when the user prefers reduced motion.
    const played = await playLoginTransition(translate('auth:login.entering'), () => navigate(target, { replace: true }))
    // A sign-in that cancelled the account's deletion always says so, after the transition.
    if (deletionCancelled) showToast(translate('auth:login.deletionCancelledToast'))
    else if (!played) showToast(translate('auth:login.successToast'))
  })

  return (
    <form className="lm-auth-tabs__panel" onSubmit={onSubmit} noValidate>
      <div className="lm-auth-form__header" data-enter="" style={enterStyle(2)}>
        <h1 className="lm-auth-form__title">{translate('auth:login.title')}</h1>
        <p className="lm-auth-form__subtitle">{translate('auth:login.subtitle')}</p>
      </div>

      <div className="lm-auth-form__fields" data-enter="" style={enterStyle(3)}>
        <Input
          label={translate('auth:fields.email.label')}
          type="email"
          placeholder={translate('auth:fields.email.placeholder')}
          autoComplete="email"
          error={errors.email?.message ? translate(errors.email.message) : undefined}
          {...register('email')}
        />
        <Input
          label={translate('auth:fields.password.label')}
          type="password"
          placeholder={translate('auth:fields.password.placeholder')}
          autoComplete="current-password"
          error={errors.password?.message ? translate(errors.password.message) : undefined}
          {...register('password')}
        />
      </div>

      <div className="lm-auth-form__forgot" data-enter="" style={enterStyle(4)}>
        <Link to="/auth/forgot-password">{translate('auth:login.forgotPassword')}</Link>
      </div>

      {errors.root?.serverError?.message ? (
        <p className="lm-auth-form__error" role="alert">
          {errors.root.serverError.message}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={isSubmitting}
        data-enter=""
        style={enterStyle(4)}
      >
        {translate('auth:login.submit')}
      </Button>

      <p className="lm-auth-form__footer" data-enter="" style={enterStyle(5)}>
        {translate('auth:login.noAccount')}{' '}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault()
            onSwitchToSignup()
          }}
        >
          {translate('auth:login.createAccount')}
        </a>
      </p>
    </form>
  )
}

export default LoginForm
