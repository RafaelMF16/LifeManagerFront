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

  if (!tour) return null

  return (
    <>
      <IconButton icon="circle-help" label={translate('common:tour.start')} onClick={start} />
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
