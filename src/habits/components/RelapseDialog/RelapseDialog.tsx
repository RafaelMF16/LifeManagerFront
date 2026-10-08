import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Dialog from '../../../shared/components/Dialog/Dialog'
import SegmentedControl from '../../../shared/components/SegmentedControl/SegmentedControl'
import type { HabitAvoidItemDto } from '../../types/HabitTodayDtos'
import { relapseCost } from '../../utils/relapseCost'
import type { RelapseDay } from '../HabitAvoidCard/HabitAvoidCard'
import './RelapseDialog.css'

interface RelapseDialogProps {
  item: HabitAvoidItemDto
  onClose: () => void
  /** Logs the relapse; the dialog stays open, with its button loading, until it settles. */
  onConfirm: (day: RelapseDay) => Promise<void>
}

/**
 * Confirms a relapse before logging it, saying what it costs: it takes HP and the streak, so a stray tap shouldn't do
 * it. Asks "today or yesterday?" when yesterday can still take one.
 */
function RelapseDialog({ item, onClose, onConfirm }: RelapseDialogProps) {
  const { t: translate } = useTranslation('habits')
  const titleId = useId()
  const days: RelapseDay[] = [...(item.relapsedToday ? [] : ['today' as const]), ...(item.canRelapseYesterday ? ['yesterday' as const] : [])]
  const [day, setDay] = useState<RelapseDay>(days[0] ?? 'today')
  const [saving, setSaving] = useState(false)

  async function confirm() {
    setSaving(true)
    try {
      await onConfirm(day)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog role="alertdialog" labelledBy={titleId} onClose={onClose}>
      <div className="lm-dialog__header">
        <h2 id={titleId} className="lm-dialog__title">
          {translate('habits:today.relapse.title', { name: item.name })}
        </h2>
      </div>

      <div className="lm-dialog__body">
        <div className="lm-relapse-dialog__body">
          {days.length > 1 ? (
            <SegmentedControl
              size="md"
              aria-label={translate('habits:today.relapse.whenLabel')}
              options={days.map((option) => ({ value: option, label: translate(`habits:today.relapse.when.${option}`) }))}
              value={day}
              onChange={setDay}
              className="lm-relapse-dialog__when"
            />
          ) : null}
          <p className="lm-dialog__message">{relapseCost(item, translate)}</p>
          <p className="lm-relapse-dialog__note">{translate('habits:today.relapse.note')}</p>
        </div>
      </div>

      <div className="lm-dialog__footer">
        <Button variant="secondary" onClick={onClose}>
          {translate('habits:actions.cancel')}
        </Button>
        <Button variant="destructive" loading={saving} onClick={() => void confirm()}>
          {translate('habits:today.relapse.confirm')}
        </Button>
      </div>
    </Dialog>
  )
}

export default RelapseDialog
