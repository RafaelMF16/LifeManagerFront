import { useState } from 'react'
import Button from '../../../shared/components/Button/Button'
import Input from '../../../shared/components/Input/Input'
import '../AuthForm.css'

interface RegisterFormProps {
  onSwitchToLogin: () => void
}

function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const mismatch = confirmPassword.length > 0 && confirmPassword !== password

  return (
    <form className="lm-auth-tabs__panel" onSubmit={(e) => e.preventDefault()}>
      <div className="lm-auth-form__header">
        <h1 className="lm-auth-form__title">Criar sua conta</h1>
        <p className="lm-auth-form__subtitle">Leva menos de um minuto.</p>
      </div>

      <div className="lm-auth-form__fields">
        <Input label="Nome" type="text" name="name" placeholder="Seu nome completo" autoComplete="name" />
        <Input label="E-mail" type="email" name="email" placeholder="voce@exemplo.com" autoComplete="email" />
        <Input
          label="Senha"
          type="password"
          name="new-password"
          placeholder="••••••••"
          autoComplete="new-password"
          hint="Mínimo de 8 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          label="Confirmar senha"
          type="password"
          name="confirm-password"
          placeholder="••••••••"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={mismatch ? 'As senhas não coincidem' : undefined}
        />
      </div>

      <Button type="submit" variant="primary" size="lg" fullWidth>
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
