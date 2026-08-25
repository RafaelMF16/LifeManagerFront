import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { AuthMode } from '../../types/AuthMode'
import './AuthTabs.css'

interface AuthTabsProps {
  active: AuthMode
  onChange: (mode: AuthMode) => void
  loginPanel: ReactNode
  signupPanel: ReactNode
}

function AuthTabs({ active, onChange, loginPanel, signupPanel }: AuthTabsProps) {
  const loginRef = useRef<HTMLDivElement>(null)
  const signupRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | null>(null)

  useEffect(() => {
    const login = loginRef.current
    const signup = signupRef.current
    if (!login || !signup) return

    const measure = () => {
      setHeight(Math.max(login.offsetHeight, signup.offsetHeight))
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(login)
    observer.observe(signup)
    return () => observer.disconnect()
  }, [])

  const isSignup = active === 'signup'

  return (
    <div className="lm-auth-tabs">
      <div className="lm-auth-tabs__bar">
        <button
          type="button"
          className={`lm-auth-tabs__tab${isSignup ? '' : ' lm-auth-tabs__tab--active'}`}
          onClick={() => onChange('login')}
        >
          Entrar
        </button>
        <button
          type="button"
          className={`lm-auth-tabs__tab${isSignup ? ' lm-auth-tabs__tab--active' : ''}`}
          onClick={() => onChange('signup')}
        >
          Criar conta
        </button>
        <div
          aria-hidden="true"
          className={`lm-auth-tabs__indicator${isSignup ? ' lm-auth-tabs__indicator--signup' : ''}`}
        />
      </div>

      <div className="lm-auth-tabs__viewport" style={{ height: height ? `${height}px` : 'auto' }}>
        <div className={`lm-auth-tabs__track${isSignup ? ' lm-auth-tabs__track--signup' : ''}`}>
          <div ref={loginRef}>{loginPanel}</div>
          <div ref={signupRef}>{signupPanel}</div>
        </div>
      </div>
    </div>
  )
}

export default AuthTabs
