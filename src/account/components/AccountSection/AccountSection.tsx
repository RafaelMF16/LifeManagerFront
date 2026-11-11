import { useId } from 'react'
import type { ReactNode } from 'react'
import Icon from '../../../shared/components/Icon/Icon'
import type { IconName } from '../../../shared/components/Icon/Icon'
import './AccountSection.css'

interface AccountSectionProps {
  title: string
  icon: IconName
  /** The danger zone: red border and icon. */
  danger?: boolean
  /** `data-tour` of the section, for the screen's tour. */
  tourTarget?: string
  children: ReactNode
}

/** One card of the "My account" page. */
function AccountSection({ title, icon, danger = false, tourTarget, children }: AccountSectionProps) {
  const titleId = useId()

  return (
    <section
      className={`lm-account-section${danger ? ' lm-account-section--danger' : ''}`}
      aria-labelledby={titleId}
      data-tour={tourTarget}
    >
      <div className="lm-account-section__header">
        <span className="lm-account-section__icon">
          <Icon name={icon} size={18} />
        </span>
        <h2 id={titleId} className="lm-account-section__title">
          {title}
        </h2>
      </div>
      <div className="lm-account-section__body">{children}</div>
    </section>
  )
}

export default AccountSection
