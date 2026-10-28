import { useCelebration } from '../../hooks/useCelebration'
import type { HabitTodayItemDto } from '../../types/HabitTodayDtos'
import HabitItemHeader from '../HabitItemHeader/HabitItemHeader'
import './HabitCheckItem.css'

interface HabitCheckItemProps {
  item: HabitTodayItemDto
  /** While its check-in is being saved: further taps are ignored. */
  pending: boolean
  onToggle: () => void
  streakRisk?: 'unprotected' | 'protected'
}

/**
 * One habit of the day's checklist. The whole row is the button (a large tap target on phones); tapping a done
 * habit undoes it.
 */
function HabitCheckItem({ item, pending, onToggle, streakRisk }: HabitCheckItemProps) {
  const { celebration, celebrate } = useCelebration()

  function handleClick() {
    // Celebrated on the tap itself: the check-in is optimistic, so the box turns done right away too.
    if (!item.done && !pending) celebrate(item.coinsPreview)
    onToggle()
  }

  return (
    <button
      type="button"
      aria-pressed={item.done}
      aria-busy={pending}
      className={`lm-habit-check${item.done ? ' lm-habit-check--done' : ''}`}
      onClick={handleClick}
    >
      <HabitItemHeader item={item} streakRisk={streakRisk} celebration={celebration} />
    </button>
  )
}

export default HabitCheckItem
