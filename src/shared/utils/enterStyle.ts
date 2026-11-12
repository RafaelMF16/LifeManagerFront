import type { CSSProperties } from 'react'

/**
 * The position of a block in an entrance cascade (`[data-enter]` under `.lm-enter`, `shared/styles/enter.css`): each
 * step starts `--stagger-step` after the previous one.
 */
export function enterStyle(index: number): CSSProperties {
  return { '--enter-index': index } as CSSProperties
}
