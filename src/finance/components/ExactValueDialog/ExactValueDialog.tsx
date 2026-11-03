import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Dialog from '../../../shared/components/Dialog/Dialog'
import IconButton from '../../../shared/components/IconButton/IconButton'
import Input from '../../../shared/components/Input/Input'
import SegmentedControl from '../../../shared/components/SegmentedControl/SegmentedControl'
import { useFinanceFormat } from '../../hooks/useFinanceFormat'
import { percentFromAmount, sliceAmount } from '../../utils/budgetPlan'
import { parseAmount, toFormAmount } from '../../validation/amountSchema'
import MoneyInput from '../MoneyInput/MoneyInput'

type Unit = 'percent' | 'amount'

interface ExactValueDialogProps {
  name: string
  percent: number
  /** How far the slice may go. */
  max: number
  /** Null while the month has no total: only a percentage can be typed then. */
  total: number | null
  /** Called with the new percent (the page keeps it within the maximum). */
  onApply: (percent: number) => void
  onClose: () => void
}

/** Types a slice's exact share, as a percentage or in money (turned into a percentage with 2 places). */
function ExactValueDialog({ name, percent, max, total, onApply, onClose }: ExactValueDialogProps) {
  const { t: translate, i18n } = useTranslation('finance')
  const { money, sharePercent } = useFinanceFormat()
  const titleId = useId()
  const [unit, setUnit] = useState<Unit>('percent')
  const [text, setText] = useState(() => toFormAmount(percent, i18n.language))
  const [error, setError] = useState<string | null>(null)

  function changeUnit(next: Unit) {
    setUnit(next)
    setText(toFormAmount(next === 'percent' ? percent : sliceAmount(total, percent), i18n.language))
    setError(null)
  }

  function changeText(next: string) {
    setText(next)
    setError(null)
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    const value = parseAmount(text)
    if (value === null) {
      setError(translate('finance:budgetPlan.exact.invalid'))
      return
    }

    onApply(unit === 'percent' ? value : percentFromAmount(total, value))
    onClose()
  }

  const hint = translate('finance:budgetPlan.exact.hint', { max: sharePercent(max), amount: money(sliceAmount(total, max)) })

  return (
    <Dialog labelledBy={titleId} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <div className="lm-dialog__header">
          <h2 id={titleId} className="lm-dialog__title">
            {translate('finance:budgetPlan.exact.title')} · {name}
          </h2>
          <IconButton icon="x" size="sm" label={translate('finance:actions.close')} onClick={onClose} />
        </div>

        <div className="lm-dialog__body">
          {total !== null ? (
            <SegmentedControl
              size="md"
              aria-label={translate('finance:budgetPlan.exact.title')}
              options={[
                { value: 'percent' as const, label: translate('finance:budgetPlan.exact.percentLabel') },
                { value: 'amount' as const, label: translate('finance:budgetPlan.exact.amountLabel') },
              ]}
              value={unit}
              onChange={changeUnit}
            />
          ) : null}
          {unit === 'amount' ? (
            // Money fills from the right, cents first; a percentage is typed freely.
            <MoneyInput
              label={translate('finance:budgetPlan.exact.amountLabel')}
              prefix={translate('finance:budgetPlan.exact.unitAmount')}
              autoFocus
              value={text}
              hint={hint}
              error={error ?? undefined}
              onChange={(event) => changeText(event.target.value)}
            />
          ) : (
            <Input
              label={translate('finance:budgetPlan.exact.percentLabel')}
              suffix={translate('finance:budgetPlan.exact.unitPercent')}
              inputMode="decimal"
              autoComplete="off"
              numeric
              autoFocus
              value={text}
              hint={hint}
              error={error ?? undefined}
              onChange={(event) => changeText(event.target.value)}
            />
          )}
        </div>

        <div className="lm-dialog__footer">
          <Button variant="secondary" onClick={onClose}>
            {translate('finance:actions.cancel')}
          </Button>
          <Button variant="primary" type="submit">
            {translate('finance:budgetPlan.exact.apply')}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

export default ExactValueDialog
