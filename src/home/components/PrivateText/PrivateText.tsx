import type { ReactNode } from 'react'
import './PrivateText.css'

interface PrivateTextProps {
  /** Privacy mode is on: `children` carries masks ("R$ ••••••", "••%"). */
  hidden: boolean
  /** What a screen reader hears instead while hidden, e.g. "Hidden amount". */
  hiddenLabel: string
  children: ReactNode
}

/**
 * Text that may carry privacy masks. While hidden, the masks are noise to a screen reader ("bullet bullet…"), so it
 * hears `hiddenLabel` instead — the same pattern as Finance's `Amount`.
 */
function PrivateText({ hidden, hiddenLabel, children }: PrivateTextProps) {
  if (!hidden) return <>{children}</>

  return (
    <>
      <span aria-hidden="true">{children}</span>
      <span className="lm-private-text__visually-hidden">{hiddenLabel}</span>
    </>
  )
}

export default PrivateText
