import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Input from '../../../shared/components/Input/Input'
import { useZodForm } from '../../../shared/hooks/useZodForm'
import { useToast } from '../../../shared/hooks/useToast'
import { useErrorModal } from '../../../shared/hooks/useErrorModal'
import { applyApiErrorToForm } from '../../../shared/utils/applyApiErrorToForm'
import { isApiError } from '../../../shared/types/ApiError'
import type { UserPreferences } from '../../../shared/types/UserPreferences'
import { register as registerUser } from '../../services/authService'
import { registerErrorFieldMap } from '../../validation/userErrorMap'
import { registerSchema } from '../../validation/userSchemas'
import { authErrorMessageKey } from '../../utils/authApiErrors'
import type { RegisterFormValues } from '../../validation/userSchemas'
import EmailSentNotice from '../EmailSentNotice/EmailSentNotice'
import '../AuthForm.css'

interface RegisterFormProps {
  // Tema e idioma da tela no momento do envio: viram o idioma do e-mail, as preferências e o idioma das categorias padrão
  preferences: UserPreferences
  onSwitchToLogin: () => void
}

function RegisterForm({ preferences, onSwitchToLogin }: RegisterFormProps) {
  const { t: translate } = useTranslation(['auth', 'common'])
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useZodForm(registerSchema)
  const { show: showToast } = useToast()
  const { show: showErrorModal } = useErrorModal()
  // What was sent: while set, the panel shows "check your e-mail" instead of the form (whose values stay in place)
  const [sent, setSent] = useState<RegisterFormValues | null>(null)

  const onSubmit = handleSubmit(async (data) => {
    try {
      await registerUser(data, preferences)
      setSent(data)
    } catch (err) {
      if (isApiError(err)) {
        applyApiErrorToForm(err, setError, registerErrorFieldMap, translate, authErrorMessageKey(err))
      } else {
        showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
      }
    }
  })

  async function resend(data: RegisterFormValues) {
    try {
      await registerUser(data, preferences)
      showToast(translate('auth:emailSent.resentToast'))
    } catch (err) {
      if (isApiError(err)) {
        showErrorModal(translate('auth:emailSent.resendFailedTitle'), translate(authErrorMessageKey(err)))
      } else {
        showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
      }
      throw err
    }
  }

  if (sent) {
    return (
      <div className="lm-auth-tabs__panel">
        <EmailSentNotice
          email={sent.email}
          message={translate('auth:register.emailSentMessage')}
          onResend={() => resend(sent)}
          onChangeEmail={() => setSent(null)}
        />
      </div>
    )
  }

  return (
    <form className="lm-auth-tabs__panel" onSubmit={onSubmit} noValidate>
      <div className="lm-auth-form__header">
        <h1 className="lm-auth-form__title">{translate('auth:register.title')}</h1>
        <p className="lm-auth-form__subtitle">{translate('auth:register.subtitle')}</p>
      </div>

      <div className="lm-auth-form__fields">
        <Input
          label={translate('auth:fields.name.label')}
          type="text"
          placeholder={translate('auth:fields.name.placeholder')}
          autoComplete="name"
          error={errors.name?.message ? translate(errors.name.message) : undefined}
          {...register('name')}
        />
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
        {translate('auth:register.submit')}
      </Button>

      <p className="lm-auth-form__footer">
        {translate('auth:register.hasAccount')}{' '}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault()
            onSwitchToLogin()
          }}
        >
          {translate('auth:register.logIn')}
        </a>
      </p>
    </form>
  )
}

export default RegisterForm
