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
      showToast('Conta criada com sucesso')
      onSwitchToLogin()
    } catch (err) {
      if (isApiError(err)) {
        applyApiErrorToForm(err, setError, registerErrorFieldMap)
      } else {
        showErrorModal(
          'Erro de conexão',
          'Não foi possível se comunicar com o servidor. Verifique sua conexão e tente novamente.',
        )
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

      <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>
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
