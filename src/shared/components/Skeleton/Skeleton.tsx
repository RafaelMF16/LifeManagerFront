import type { CSSProperties } from 'react'
import './Skeleton.css'

export type SkeletonShape = 'text' | 'circle' | 'block' | 'pill'

interface SkeletonProps {
  /** `text`: one line of the surrounding text; `circle`: an icon or avatar (`width` sets both sides); `block`: any box. */
  shape?: SkeletonShape
  width?: number | string
  height?: number | string
  className?: string
}

/**
 * One placeholder block standing in for content that is still loading. Decorative: put it inside a `SkeletonGroup`,
 * which tells screen readers what is loading.
 */
function Skeleton({ shape = 'text', width, height, className }: SkeletonProps) {
  const style: CSSProperties = { width, height: shape === 'circle' ? (height ?? width) : height }

  return (
    <span
      className={`lm-skeleton lm-skeleton--${shape}${className ? ` ${className}` : ''}`}
      style={style}
      aria-hidden="true"
    />
  )
}

export default Skeleton
