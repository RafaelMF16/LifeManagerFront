import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import Button from '../Button/Button'
import IconButton from '../IconButton/IconButton'
import { findTourTarget } from '../../hooks/useTour'
import type { TourDefinition, TourRect, TourSize, TourStep } from '../../types/Tour'
import { tourPlacement } from '../../utils/tourPlacement'
import './TourOverlay.css'

/** Room around the highlighted element, so the spotlight doesn't clip its border or focus ring. */
const SPOTLIGHT_PADDING = 6

interface TourOverlayProps {
  tour: TourDefinition
  step: TourStep
  index: number
  count: number
  onNext: () => void
  onPrevious: () => void
  onClose: () => void
}

function padded(rect: DOMRect): TourRect {
  return {
    top: rect.top - SPOTLIGHT_PADDING,
    left: rect.left - SPOTLIGHT_PADDING,
    width: rect.width + SPOTLIGHT_PADDING * 2,
    height: rect.height + SPOTLIGHT_PADDING * 2,
  }
}

/**
 * Follows the step's target on screen: scrolls it into view, then re-measures on scroll (any container) and resize,
 * once per frame. `null` while the step has no target, or once its element left the page (the step then shows
 * centered instead of pointing at nothing).
 */
function useTargetRect(target: string | undefined) {
  const [rect, setRect] = useState<TourRect | null>(null)

  useLayoutEffect(() => {
    // The overlay remounts per step (`key`), so a step without an element simply keeps the initial `null`.
    const element = target ? findTourTarget(target) : null
    if (!element) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    element.scrollIntoView({ block: 'center', inline: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' })

    let frame = 0
    function measure() {
      const box = element!.getBoundingClientRect()
      setRect(element!.isConnected && box.width > 0 && box.height > 0 ? padded(box) : null)
    }
    function schedule() {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('resize', schedule)
    window.addEventListener('scroll', schedule, true)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', schedule)
      window.removeEventListener('scroll', schedule, true)
    }
  }, [target])

  return rect
}

/**
 * The open tour: a layer over the page that takes every click (the tour explains, it doesn't act), a spotlight
 * cut out around the step's element and the balloon next to it. A step without a target shows the balloon centered
 * over a plain scrim.
 */
function TourOverlay({ tour, step, index, count, onNext, onPrevious, onClose }: TourOverlayProps) {
  const { t: translate } = useTranslation(['common', tour.namespace])
  const titleId = useId()
  const bodyId = useId()
  const popoverRef = useRef<HTMLDivElement>(null)
  const [popoverSize, setPopoverSize] = useState<TourSize | null>(null)
  const rect = useTargetRect(step.target)
  const isLast = index === count - 1
  const copyKey = `${tour.namespace}:tour.${tour.id}.${step.id}`

  // The balloon's height follows its copy and the screen's width, so it is observed and placed once it is known.
  useLayoutEffect(() => {
    const popover = popoverRef.current
    if (!popover) return
    const observer = new ResizeObserver(() => {
      const { width, height } = popover.getBoundingClientRect()
      setPopoverSize((current) => (current?.width === width && current.height === height ? current : { width, height }))
    })
    observer.observe(popover)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const placement =
    rect && popoverSize
      ? tourPlacement(rect, popoverSize, { width: window.innerWidth, height: window.innerHeight })
      : null

  const popoverStyle: CSSProperties | undefined = placement
    ? ({ top: placement.top, left: placement.left, '--tour-arrow-offset': `${placement.arrowOffset}px` } as CSSProperties)
    : undefined

  const popoverClasses = [
    'lm-tour__popover',
    rect ? (placement ? `lm-tour__popover--${placement.side}` : 'lm-tour__popover--measuring') : 'lm-tour__popover--center',
  ].join(' ')

  return createPortal(
    <div className={`lm-tour${rect ? '' : ' lm-tour--centered'}`}>
      {rect ? (
        <div
          className="lm-tour__spotlight"
          style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
          aria-hidden="true"
        />
      ) : null}

      <div
        ref={popoverRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        className={popoverClasses}
        style={popoverStyle}
      >
        <div className="lm-tour__header">
          <span className="lm-tour__counter">
            {translate('common:tour.step', { current: index + 1, total: count })}
          </span>
          <IconButton icon="x" size="sm" label={translate('common:tour.close')} onClick={onClose} />
        </div>

        <h2 id={titleId} className="lm-tour__title">
          {translate(`${copyKey}.title`)}
        </h2>
        <p id={bodyId} className="lm-tour__body">
          {translate(`${copyKey}.body`)}
        </p>

        <div className="lm-tour__footer">
          {isLast ? null : (
            <Button variant="ghost" size="sm" onClick={onClose}>
              {translate('common:tour.skip')}
            </Button>
          )}
          <div className="lm-tour__nav">
            {index > 0 ? (
              <Button variant="secondary" size="sm" onClick={onPrevious}>
                {translate('common:tour.previous')}
              </Button>
            ) : null}
            <Button variant="primary" size="sm" onClick={onNext}>
              {translate(isLast ? 'common:tour.done' : 'common:tour.next')}
            </Button>
          </div>
        </div>

        {placement ? <span className="lm-tour__arrow" aria-hidden="true" /> : null}
      </div>
    </div>,
    document.body,
  )
}

export default TourOverlay
