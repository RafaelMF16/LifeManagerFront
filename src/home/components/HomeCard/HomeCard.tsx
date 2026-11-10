import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Icon, { type IconName } from '../../../shared/components/Icon/Icon'
import Skeleton from '../../../shared/components/Skeleton/Skeleton'
import SkeletonGroup from '../../../shared/components/Skeleton/SkeletonGroup'
import type { HomeOverviewStatus } from '../../hooks/useHomeOverview'
import './HomeCard.css'

interface HomeCardProps {
  id: string
  icon: IconName
  title: string
  status: HomeOverviewStatus
  /** Read by screen readers while the card loads. */
  loadingLabel: string
  onRetry: () => void
  /** Next to the title (e.g. the privacy toggle). */
  headerAction?: ReactNode
  /** The card's buttons, below its content. */
  actions?: ReactNode
  /**
   * Whether the error is announced (`role="alert"`). Both cards fail together (one request), so only one of them
   * announces it; the other just shows it.
   */
  announceError?: boolean
  /** `data-tour` of the card, for the Home's tour. */
  tourTarget?: string
  children?: ReactNode
}

/** One of the Home's summary cards: title, then a skeleton, an error with "Try again", or the content and its buttons. */
function HomeCard({
  id,
  icon,
  title,
  status,
  loadingLabel,
  onRetry,
  headerAction,
  actions,
  announceError = true,
  tourTarget,
  children,
}: HomeCardProps) {
  const { t: translate } = useTranslation('home')
  const titleId = `lm-home-card-${id}`

  return (
    <section className="lm-home-card" aria-labelledby={titleId} data-tour={tourTarget}>
      <header className="lm-home-card__header">
        <span className="lm-home-card__icon">
          <Icon name={icon} size={18} />
        </span>
        <h2 id={titleId} className="lm-home-card__title">
          {title}
        </h2>
        {headerAction ? <span className="lm-home-card__header-action">{headerAction}</span> : null}
      </header>

      {status === 'loading' ? (
        <SkeletonGroup label={loadingLabel} className="lm-home-card__body">
          <Skeleton width="60%" />
          <Skeleton shape="pill" width="100%" height={8} />
          <Skeleton width="45%" />
          <Skeleton width="70%" />
        </SkeletonGroup>
      ) : status === 'error' ? (
        <div className="lm-home-card__body lm-home-card__error" role={announceError ? 'alert' : undefined}>
          <p>{translate('card.error')}</p>
          <Button variant="secondary" icon="refresh-cw" onClick={onRetry}>
            {translate('card.retry')}
          </Button>
        </div>
      ) : (
        <>
          <div className="lm-home-card__body">{children}</div>
          {actions ? <div className="lm-home-card__actions">{actions}</div> : null}
        </>
      )}
    </section>
  )
}

export default HomeCard
