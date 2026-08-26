import Button from '../../../shared/components/Button/Button'
import Input from '../../../shared/components/Input/Input'
import '../AuthForm.css'

interface LoginFormProps {
  onSwitchToSignup: () => void
}

function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  return (
    <form className="lm-auth-tabs__panel" onSubmit={(e) => e.preventDefault()}>
      <div className="lm-auth-form__header">
        <h1 className="lm-auth-form__title">Entrar na sua conta</h1>
        <p className="lm-auth-form__subtitle">Organize sua vida financeira e seus hábitos em um só lugar.</p>
      </div>

      <div className="lm-auth-form__fields">
        <Input label="E-mail" type="email" name="email" placeholder="voce@exemplo.com" autoComplete="email" />
        <Input
          label="Senha"
          type="password"
          name="password"
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </div>

      <div className="lm-auth-form__forgot">
        <a href="#">Esqueceu a senha?</a>
      </div>

      <Button type="submit" variant="primary" size="lg" fullWidth>
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
