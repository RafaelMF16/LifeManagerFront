import Button from '../../../shared/components/Button/Button'
import Input from '../../../shared/components/Input/Input'
import { useZodForm } from '../../../shared/hooks/useZodForm'
import { applyApiErrorToForm } from '../../../shared/utils/applyApiErrorToForm'
import { isApiError } from '../../../shared/types/ApiError'
import { registerErrorFieldMap } from '../../validation/userErrorMap'
import { registerSchema } from '../../validation/userSchemas'
import type { RegisterFormValues } from '../../validation/userSchemas'
import '../AuthForm.css'

interface RegisterFormProps {
  onSwitchToLogin: () => void
}

function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useZodForm(registerSchema)

  const onSubmit = handleSubmit(async (_data: RegisterFormValues) => {
    try {
      // TODO: chamar auth/services quando a integração com o backend existir.
    } catch (err) {
      if (isApiError(err)) {
        applyApiErrorToForm(err, setError, registerErrorFieldMap)
      } else {
        setError('root.serverError', { message: 'Não foi possível concluir. Tente novamente.' })
      }
    }
  })

  return (
    <form className="lm-auth-tabs__panel" onSubmit={onSubmit} noValidate>
      <div className="lm-auth-form__header">
        <h1 className="lm-auth-form__title">Criar sua conta</h1>
        <p className="lm-auth-form__subtitle">Leva menos de um minuto.</p>
      </div>

      <div className="lm-auth-form__fields">
        <Input
          label="Nome"
          type="text"
          placeholder="Seu nome completo"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="E-mail"
          type="email"
          placeholder="voce@exemplo.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Senha"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          hint="Mínimo de 8 caracteres"
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Confirmar senha"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
      </div>

      {errors.root?.serverError?.message ? (
        <p className="lm-auth-form__error" role="alert">
          {errors.root.serverError.message}
        </p>
      ) : null}

      <Button type="submit" variant="primary" size="lg" fullWidth disabled={isSubmitting}>
        Criar conta
      </Button>

      <p className="lm-auth-form__footer">
        Já tem conta?{' '}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault()
            onSwitchToLogin()
          }}
        >
          Entrar
        </a>
      </p>
    </form>
  )
}

export default RegisterForm
