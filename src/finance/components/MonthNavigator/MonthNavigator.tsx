import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import IconButton from '../../../shared/components/IconButton/IconButton'
import { useFinanceFormat } from '../../hooks/useFinanceFormat'
import { addMonths, parseYearMonth, toYearMonth } from '../../utils/yearMonth'
import './MonthNavigator.css'

interface MonthNavigatorProps {
  /** `yyyy-MM`. */
  month: string
  onChange: (month: string) => void
}

/** Steps through months one at a time, with a shortcut back to the current one. */
function MonthNavigator({ month, onChange }: MonthNavigatorProps) {
  const { t: translate } = useTranslation('finance')
  const { periodLabel } = useFinanceFormat()
  const parsed = parseYearMonth(month)
  const currentMonth = toYearMonth(new Date())
  const isCurrent = month === currentMonth

  return (
    <div className="lm-month-navigator">
      <IconButton
        icon="chevron-left"
        variant="secondary"
        label={translate('finance:monthNavigator.previous')}
        onClick={() => onChange(addMonths(month, -1))}
      />
      <div className="lm-month-navigator__label" aria-live="polite">
        <span className="lm-month-navigator__period">{parsed ? periodLabel(parsed.month, parsed.year) : month}</span>
        {isCurrent ? <span className="lm-month-navigator__badge">{translate('finance:monthNavigator.current')}</span> : null}
      </div>
      <IconButton
        icon="chevron-right"
        variant="secondary"
        label={translate('finance:monthNavigator.next')}
        onClick={() => onChange(addMonths(month, 1))}
      />
      {!isCurrent ? (
        <Button variant="ghost" size="sm" onClick={() => onChange(currentMonth)} className="lm-month-navigator__today">
          {translate('finance:monthNavigator.goToCurrent')}
        </Button>
      ) : null}
    </div>
  )
}

export default MonthNavigator
