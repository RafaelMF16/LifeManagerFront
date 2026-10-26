import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Button from '../../shared/components/Button/Button'
import Input from '../../shared/components/Input/Input'
import { useZodForm } from '../../shared/hooks/useZodForm'
import { useToast } from '../../shared/hooks/useToast'
import { useErrorModal } from '../../shared/hooks/useErrorModal'
import { applyApiErrorToForm } from '../../shared/utils/applyApiErrorToForm'
import { isApiError } from '../../shared/types/ApiError'
import AuthLayout from '../components/AuthLayout/AuthLayout'
import EmailSentNotice from '../components/EmailSentNotice/EmailSentNotice'
import { requestPasswordReset } from '../services/authService'
import { forgotPasswordErrorFieldMap } from '../validation/userErrorMap'
import { forgotPasswordSchema } from '../validation/userSchemas'
import type { ForgotPasswordFormValues } from '../validation/userSchemas'
import type { AuthPageState } from './AuthPage'
import '../components/AuthForm.css'

/** `/auth/forgot-password`, from the login's "Forgot your password?": asks for the e-mail that gets the reset link. */
function ForgotPasswordPage() {
  const { t: translate } = useTranslation(['auth', 'common'])
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useZodForm(forgotPasswordSchema)
  const { show: showToast } = useToast()
  const { show: showErrorModal } = useErrorModal()
  // What was sent: while set, the card shows "check your e-mail" instead of the form (whose value stays in place)
  const [sent, setSent] = useState<ForgotPasswordFormValues | null>(null)

  const onSubmit = handleSubmit(async (data) => {
    try {
      await requestPasswordReset(data)
      setSent(data)
    } catch (err) {
      if (isApiError(err)) {
        applyApiErrorToForm(err, setError, forgotPasswordErrorFieldMap, translate)
      } else {
        showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
      }
    }
  })

  async function resend(data: ForgotPasswordFormValues) {
    try {
      await requestPasswordReset(data)
      showToast(translate('auth:emailSent.resentToast'))
    } catch (err) {
      if (isApiError(err)) {
        showErrorModal(translate('auth:emailSent.resendFailedTitle'), translate('common:errors.generic'))
      } else {
        showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
      }
      throw err
    }
  }

  const backToLogin = (
    <p className="lm-auth-form__footer">
      <Link to="/auth" replace state={{ mode: 'login' } satisfies AuthPageState}>
        {translate('auth:forgotPassword.backToLogin')}
      </Link>
    </p>
  )

  return (
    <AuthLayout>
      <div className="lm-auth-card">
        {sent ? (
          <>
            <EmailSentNotice
              email={sent.email}
              message={translate('auth:forgotPassword.emailSentMessage')}
              onResend={() => resend(sent)}
              onChangeEmail={() => setSent(null)}
            />
            {backToLogin}
          </>
        ) : (
          <form className="lm-auth-form__fields-group" onSubmit={onSubmit} noValidate>
            <div className="lm-auth-form__header">
              <h1 className="lm-auth-form__title">{translate('auth:forgotPassword.title')}</h1>
              <p className="lm-auth-form__subtitle">{translate('auth:forgotPassword.subtitle')}</p>
            </div>

            <div className="lm-auth-form__fields">
              <Input
                label={translate('auth:fields.email.label')}
                type="email"
                placeholder={translate('auth:fields.email.placeholder')}
                autoComplete="email"
                error={errors.email?.message ? translate(errors.email.message) : undefined}
                {...register('email')}
              />
            </div>

            {errors.root?.serverError?.message ? (
              <p className="lm-auth-form__error" role="alert">
                {errors.root.serverError.message}
              </p>
            ) : null}

            <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>
              {translate('auth:forgotPassword.submit')}
            </Button>

            {backToLogin}
          </form>
        )}
      </div>
    </AuthLayout>
  )
}

export default ForgotPasswordPage
