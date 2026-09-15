import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Input from '../../../shared/components/Input/Input'
import { useZodForm } from '../../../shared/hooks/useZodForm'
import { useToast } from '../../../shared/hooks/useToast'
import { useErrorModal } from '../../../shared/hooks/useErrorModal'
import { applyApiErrorToForm } from '../../../shared/utils/applyApiErrorToForm'
import { isApiError } from '../../../shared/types/ApiError'
import { register as registerUser } from '../../services/authService'
import { registerErrorFieldMap } from '../../validation/userErrorMap'
import { registerSchema } from '../../validation/userSchemas'
import '../AuthForm.css'

interface RegisterFormProps {
  onSwitchToLogin: () => void
}

function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const { t: translate } = useTranslation(['auth', 'common'])
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useZodForm(registerSchema)
  const { show: showToast } = useToast()
  const { show: showErrorModal } = useErrorModal()

  const onSubmit = handleSubmit(async (data) => {
    try {
      await registerUser(data)
      showToast(translate('auth:register.successToast'))
      onSwitchToLogin()
    } catch (err) {
      if (isApiError(err)) {
        applyApiErrorToForm(err, setError, registerErrorFieldMap, translate)
      } else {
        showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
      }
    }
  })

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
        <Input
          label={translate('auth:fields.password.label')}
          type="password"
          placeholder={translate('auth:fields.password.placeholder')}
          autoComplete="new-password"
          hint={translate('auth:fields.password.hint')}
          error={errors.password?.message ? translate(errors.password.message) : undefined}
          {...register('password')}
        />
        <Input
          label={translate('auth:fields.confirmPassword.label')}
          type="password"
          placeholder={translate('auth:fields.confirmPassword.placeholder')}
          autoComplete="new-password"
          error={errors.confirmPassword?.message ? translate(errors.confirmPassword.message) : undefined}
          {...register('confirmPassword')}
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
