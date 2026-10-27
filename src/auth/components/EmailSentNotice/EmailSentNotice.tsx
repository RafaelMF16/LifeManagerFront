import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Icon from '../../../shared/components/Icon/Icon'
import { useResendCooldown } from '../../hooks/useResendCooldown'
import '../AuthForm.css'
import './EmailSentNotice.css'

interface EmailSentNoticeProps {
  email: string
  // What the e-mail is for, already translated: "...to create your account" / "...to reset your password"
  message: string
  // Requests the same e-mail again; rejects to let the caller show its error UI
  onResend: () => Promise<void>
  // "Use another e-mail": back to the form, keeping what was typed
  onChangeEmail: () => void
}

/**
 * Shown after the sign-up or the "forgot password" form: the link went to `email`. The API answers the same whether or
 * not the address has an account, so this never claims more than "if it's right, it will arrive".
 */
function EmailSentNotice({ email, message, onResend, onChangeEmail }: EmailSentNoticeProps) {
  const { t: translate } = useTranslation('auth')
  const { secondsLeft, restart } = useResendCooldown()
  const [isResending, setIsResending] = useState(false)

  async function resend() {
    setIsResending(true)
    try {
      await onResend()
      restart()
    } catch {
      // The caller already showed the error.
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="lm-email-sent" role="status">
      <span className="lm-email-sent__icon">
        <Icon name="mail" size={24} />
      </span>

      <div className="lm-auth-form__header">
        <h1 className="lm-auth-form__title">{translate('auth:emailSent.title')}</h1>
        <p className="lm-auth-form__subtitle">
          {translate('auth:emailSent.sentTo')} <strong className="lm-email-sent__address">{email}</strong>
        </p>
        <p className="lm-auth-form__subtitle">{message}</p>
        <p className="lm-auth-form__subtitle">{translate('auth:emailSent.spamHint')}</p>
      </div>

      <Button
        variant="secondary"
        size="lg"
        fullWidth
        loading={isResending}
        disabled={secondsLeft > 0}
        onClick={resend}
      >
        {secondsLeft > 0
          ? translate('auth:emailSent.resendIn', { seconds: secondsLeft })
          : translate('auth:emailSent.resend')}
      </Button>

      <p className="lm-auth-form__footer">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault()
            onChangeEmail()
          }}
        >
          {translate('auth:emailSent.changeEmail')}
        </a>
      </p>
    </div>
  )
}

export default EmailSentNotice
