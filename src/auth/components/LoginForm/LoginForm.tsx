import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Input from '../../../shared/components/Input/Input'
import { useZodForm } from '../../../shared/hooks/useZodForm'
import { useToast } from '../../../shared/hooks/useToast'
import { useErrorModal } from '../../../shared/hooks/useErrorModal'
import { applyApiErrorToForm } from '../../../shared/utils/applyApiErrorToForm'
import { isApiError } from '../../../shared/types/ApiError'
import { login } from '../../services/authService'
import { loginErrorFieldMap, loginFallbackMessage } from '../../validation/userErrorMap'
import { loginSchema } from '../../validation/userSchemas'
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
  const navigate = useNavigate()

  const onSubmit = handleSubmit(async (data) => {
    try {
      await login(data)
      showToast(translate('auth:login.successToast'))
      navigate('/home')
    } catch (err) {
      if (isApiError(err)) {
        applyApiErrorToForm(err, setError, loginErrorFieldMap, translate, loginFallbackMessage)
      } else {
        showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
      }
    }
  })

  return (
    <form className="lm-auth-tabs__panel" onSubmit={onSubmit} noValidate>
      <div className="lm-auth-form__header">
        <h1 className="lm-auth-form__title">{translate('auth:login.title')}</h1>
        <p className="lm-auth-form__subtitle">{translate('auth:login.subtitle')}</p>
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
        <Input
          label={translate('auth:fields.password.label')}
          type="password"
          placeholder={translate('auth:fields.password.placeholder')}
          autoComplete="current-password"
          error={errors.password?.message ? translate(errors.password.message) : undefined}
          {...register('password')}
        />
      </div>

      <div className="lm-auth-form__forgot">
        <a href="#">{translate('auth:login.forgotPassword')}</a>
      </div>

      {errors.root?.serverError?.message ? (
        <p className="lm-auth-form__error" role="alert">
          {errors.root.serverError.message}
        </p>
      ) : null}

      <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>
        {translate('auth:login.submit')}
      </Button>

      <p className="lm-auth-form__footer">
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
