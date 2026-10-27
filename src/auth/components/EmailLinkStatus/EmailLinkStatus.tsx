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

  // Every failure is a title, a message and the one way out: try again, or get a new link.
  const failure = {
    error: {
      title: translate('common:errors.connection.title'),
      message: translate('common:errors.connection.message'),
      actionLabel: translate('auth:emailLink.retry'),
      onAction: onRetry,
    },
    tooManyRequests: {
      title: translate('auth:errors.tooManyRequestsTitle'),
      message: translate('auth:errors.tooManyRequests'),
      actionLabel: translate('auth:emailLink.retry'),
      onAction: onRetry,
    },
    invalid: {
      title: translate('auth:emailLink.invalidTitle'),
      message: translate('auth:emailLink.invalidMessage'),
      actionLabel: newLinkLabel,
      onAction: onNewLink,
    },
  }[state]

  return (
    <>
      <div className="lm-auth-form__header">
        <h1 className="lm-auth-form__title">{failure.title}</h1>
        <p className="lm-auth-form__subtitle">{failure.message}</p>
      </div>
      <Button variant="primary" size="lg" fullWidth onClick={failure.onAction}>
        {failure.actionLabel}
      </Button>
    </>
  )
}

export default EmailLinkStatus
