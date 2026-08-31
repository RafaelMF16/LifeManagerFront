import Button from '../../../shared/components/Button/Button'
import Input from '../../../shared/components/Input/Input'
import { useZodForm } from '../../../shared/hooks/useZodForm'
import { applyApiErrorToForm } from '../../../shared/utils/applyApiErrorToForm'
import { isApiError } from '../../../shared/types/ApiError'
import { loginErrorFieldMap, loginFallbackMessage } from '../../validation/userErrorMap'
import { loginSchema } from '../../validation/userSchemas'
import type { LoginFormValues } from '../../validation/userSchemas'
import '../AuthForm.css'

interface LoginFormProps {
  onSwitchToSignup: () => void
}

function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useZodForm(loginSchema)

  const onSubmit = handleSubmit(async (_data: LoginFormValues) => {
    try {
      // TODO: chamar auth/services quando a integração com o backend existir.
    } catch (err) {
      if (isApiError(err)) {
        applyApiErrorToForm(err, setError, loginErrorFieldMap, loginFallbackMessage)
      } else {
        setError('root.serverError', { message: 'Não foi possível concluir. Tente novamente.' })
      }
    }
  })

  return (
    <form className="lm-auth-tabs__panel" onSubmit={onSubmit}>
      <div className="lm-auth-form__header">
        <h1 className="lm-auth-form__title">Entrar na sua conta</h1>
        <p className="lm-auth-form__subtitle">Organize sua vida financeira e seus hábitos em um só lugar.</p>
      </div>

      <div className="lm-auth-form__fields">
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
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
      </div>

      <div className="lm-auth-form__forgot">
        <a href="#">Esqueceu a senha?</a>
      </div>

      {errors.root?.serverError?.message ? (
        <p className="lm-auth-form__error" role="alert">
          {errors.root.serverError.message}
        </p>
      ) : null}

      <Button type="submit" variant="primary" size="lg" fullWidth disabled={isSubmitting}>
        Entrar
      </Button>

      <p className="lm-auth-form__footer">
        Não tem conta?{' '}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault()
            onSwitchToSignup()
          }}
        >
          Criar conta
        </a>
      </p>
    </form>
  )
}

export default LoginForm
