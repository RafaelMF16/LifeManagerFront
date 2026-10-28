import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Icon from '../../../shared/components/Icon/Icon'
import IconButton from '../../../shared/components/IconButton/IconButton'
import type { HabitProgressEntryDto } from '../../types/HabitTodayDtos'
import { formatAmount } from '../../utils/habitProgress'
import './ProgressEntriesList.css'

interface ProgressEntriesListProps {
  entries: HabitProgressEntryDto[]
  unit: string
  onRemove: (entry: HabitProgressEntryDto) => void
}

/** The day's logged amounts, collapsed behind "Entries (N)"; each one can be removed. */
function ProgressEntriesList({ entries, unit, onRemove }: ProgressEntriesListProps) {
  const { t: translate, i18n } = useTranslation('habits')
  const [open, setOpen] = useState(false)
  const listId = useId()

  if (entries.length === 0) return null

  const timeFormatter = new Intl.DateTimeFormat(i18n.language, { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="lm-progress-entries">
      <button
        type="button"
        className="lm-progress-entries__toggle"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
      >
        {translate('habits:today.progress.entries', { count: entries.length })}
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={14} aria-hidden="true" />
      </button>

      {open ? (
        <ul id={listId} className="lm-progress-entries__list">
          {entries.map((entry) => {
            const time = timeFormatter.format(new Date(entry.createdAt))
            const value = formatAmount(entry.value, i18n.language)
            return (
              <li key={entry.id} className="lm-progress-entries__item">
                <span className="lm-progress-entries__time">{time}</span>
                <span className="lm-progress-entries__value">
                  {value} {unit}
                </span>
                <IconButton
                  icon="x"
                  size="sm"
                  label={translate('habits:today.progress.removeEntry', { value, unit, time })}
                  onClick={() => onRemove(entry)}
                />
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

export default ProgressEntriesList
