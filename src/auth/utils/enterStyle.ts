import type { CSSProperties } from 'react'

/**
 * The position of a block in the sign-in screen's entrance cascade (`[data-enter]` in `AuthLayout.css`): each step
 * starts `--stagger-step` after the previous one.
 */
export function enterStyle(index: number): CSSProperties {
  return { '--enter-index': index } as CSSProperties
}
