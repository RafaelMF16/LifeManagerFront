import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Button from '../../shared/components/Button/Button'
import Input from '../../shared/components/Input/Input'
import AuthLayout from '../components/AuthLayout/AuthLayout'
import EmailSentNotice from '../components/EmailSentNotice/EmailSentNotice'
import { useEmailRequestForm } from '../hooks/useEmailRequestForm'
import { requestPasswordReset } from '../services/authService'
import { forgotPasswordErrorFieldMap } from '../validation/userErrorMap'
import { forgotPasswordSchema } from '../validation/userSchemas'
import type { AuthPageState } from './AuthPage'
import '../components/AuthForm.css'

/** `/auth/forgot-password`, from the login's "Forgot your password?": asks for the e-mail that gets the reset link. */
function ForgotPasswordPage() {
  const { t: translate } = useTranslation(['auth', 'common'])
  const {
    form: {
      register,
      formState: { errors, isSubmitting },
    },
    sent,
    onSubmit,
    resend,
    changeEmail,
  } = useEmailRequestForm(forgotPasswordSchema, requestPasswordReset, forgotPasswordErrorFieldMap)

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
              onResend={resend}
              onChangeEmail={changeEmail}
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
