import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import IconButton from '../IconButton/IconButton'
import { useTour } from '../../hooks/useTour'
import type { TourDefinition } from '../../types/Tour'
import TourOverlay from './TourOverlay'

interface TourButtonProps {
  /** The module's tours; the button only shows on a screen that has one. */
  tours: TourDefinition[]
}

/** Header "?" button that starts the guided tour of the screen that is open. */
function TourButton({ tours }: TourButtonProps) {
  const { t: translate } = useTranslation('common')
  const { tour, active, start, next, previous, close } = useTour(tours)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const isOpen = active !== null
  const wasOpen = useRef(false)

  // Hands the focus back to the "?" once the tour closes, however it closed.
  useEffect(() => {
    if (wasOpen.current && !isOpen) buttonRef.current?.focus()
    wasOpen.current = isOpen
  }, [isOpen])

  if (!tour) return null

  return (
    <>
      <IconButton ref={buttonRef} icon="circle-help" label={translate('common:tour.start')} onClick={start} />
      {active ? (
        <TourOverlay
          key={active.step.id}
          tour={active.tour}
          step={active.step}
          index={active.index}
          count={active.count}
          onNext={next}
          onPrevious={previous}
          onClose={close}
        />
      ) : null}
    </>
  )
}

export default TourButton
