import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import type { EmailTokenState } from '../../hooks/useEmailToken'
import '../AuthForm.css'

interface EmailLinkStatusProps {
  state: Exclude<EmailTokenState<unknown>['status'], 'valid'>
  // Invalid link: where to get a new one ("Back to sign-up" / "Request a new link")
  newLinkLabel: string
  onNewLink: () => void
  onRetry: () => void
}

/** What the set/reset password pages show while the link is checked, or when it can't be used. */
function EmailLinkStatus({ state, newLinkLabel, onNewLink, onRetry }: EmailLinkStatusProps) {
  const { t: translate } = useTranslation(['auth', 'common'])

  if (state === 'loading') {
    return (
      <p className="lm-auth-form__subtitle" role="status">
        {translate('auth:emailLink.checking')}
      </p>
    )
  }

  if (state === 'error' || state === 'tooManyRequests') {
    return (
      <>
        <div className="lm-auth-form__header">
          {state === 'error' ? (
            <>
              <h1 className="lm-auth-form__title">{translate('common:errors.connection.title')}</h1>
              <p className="lm-auth-form__subtitle">{translate('common:errors.connection.message')}</p>
            </>
          ) : (
            <>
              <h1 className="lm-auth-form__title">{translate('auth:errors.tooManyRequestsTitle')}</h1>
              <p className="lm-auth-form__subtitle">{translate('auth:errors.tooManyRequests')}</p>
            </>
          )}
        </div>
        <Button variant="primary" size="lg" fullWidth onClick={onRetry}>
          {translate('auth:emailLink.retry')}
        </Button>
      </>
    )
  }

  return (
    <>
      <div className="lm-auth-form__header">
        <h1 className="lm-auth-form__title">{translate('auth:emailLink.invalidTitle')}</h1>
        <p className="lm-auth-form__subtitle">{translate('auth:emailLink.invalidMessage')}</p>
      </div>
      <Button variant="primary" size="lg" fullWidth onClick={onNewLink}>
        {newLinkLabel}
      </Button>
    </>
  )
}

export default EmailLinkStatus
