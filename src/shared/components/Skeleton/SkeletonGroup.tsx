import type { ReactNode } from 'react'
import './Skeleton.css'

interface SkeletonGroupProps {
  /** Read by screen readers in place of the blocks, e.g. `translate('finance:transactions.list.loading')`. */
  label: string
  /** The real content's layout class, so the placeholder takes the same space and nothing jumps when it loads. */
  className?: string
  children: ReactNode
}

/** A loading placeholder shaped like the content on its way: `Skeleton` blocks inside the real layout. */
function SkeletonGroup({ label, className, children }: SkeletonGroupProps) {
  return (
    <div className={className} role="status" aria-busy="true">
      <span className="lm-skeleton-group__label">{label}</span>
      {children}
    </div>
  )
}

export default SkeletonGroup
