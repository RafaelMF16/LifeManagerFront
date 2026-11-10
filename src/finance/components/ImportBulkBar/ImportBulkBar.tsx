import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Select from '../../../shared/components/Select/Select'
import type { MoneyFlowType } from '../../types/TransactionDtos'
import CategoryPicker from '../CategoryPicker/CategoryPicker'
import './ImportBulkBar.css'

const TYPES: MoneyFlowType[] = ['Expense', 'Income', 'Investment']

interface ImportBulkBarProps {
  count: number
  busy: boolean
  onSetCategory: (categoryId: number) => void
  onSetType: (type: MoneyFlowType) => void
  onSetIncluded: (included: boolean) => void
  onSetShiftToNextMonth: (shiftToNextMonth: boolean) => void
  onClear: () => void
}

/**
 * What can be done to the selected rows at once: file them, change their type, include or leave them out, and
 * count them in the next month or in their date's month.
 */
function ImportBulkBar({ count, busy, onSetCategory, onSetType, onSetIncluded, onSetShiftToNextMonth, onClear }: ImportBulkBarProps) {
  const { t: translate } = useTranslation('finance')

  return (
    <div className="lm-import-bulk" role="region" aria-label={translate('finance:imports.bulk.aria')}>
      <span className="lm-import-bulk__count" aria-live="polite">
        {translate('finance:imports.bulk.selected', { count })}
      </span>
      <div className="lm-import-bulk__controls">
        <CategoryPicker
          size="sm"
          ariaLabel={translate('finance:imports.bulk.category')}
          placeholder={translate('finance:imports.bulk.category')}
          value={null}
          disabled={busy}
          onChange={(category) => category && onSetCategory(category.id)}
          containerClassName="lm-import-bulk__select lm-import-bulk__category"
        />
        <Select
          size="sm"
          aria-label={translate('finance:imports.bulk.type')}
          options={[
            { value: '', label: translate('finance:imports.bulk.type') },
            ...TYPES.map((type) => ({ value: type, label: translate(`finance:imports.rows.types.${type}`) })),
          ]}
          value=""
          disabled={busy}
          onChange={(event) => event.target.value && onSetType(event.target.value as MoneyFlowType)}
          containerClassName="lm-import-bulk__select"
        />
        <Select
          size="sm"
          aria-label={translate('finance:imports.bulk.month')}
          options={[
            { value: '', label: translate('finance:imports.bulk.month') },
            { value: 'next', label: translate('finance:imports.bulk.monthNext') },
            { value: 'same', label: translate('finance:imports.bulk.monthSame') },
          ]}
          value=""
          disabled={busy}
          onChange={(event) => event.target.value && onSetShiftToNextMonth(event.target.value === 'next')}
          containerClassName="lm-import-bulk__select"
        />
        <Button variant="secondary" size="sm" icon="eye" disabled={busy} onClick={() => onSetIncluded(true)}>
          {translate('finance:imports.bulk.include')}
        </Button>
        <Button variant="secondary" size="sm" icon="eye-off" disabled={busy} onClick={() => onSetIncluded(false)}>
          {translate('finance:imports.bulk.exclude')}
        </Button>
        <Button variant="ghost" size="sm" icon="x" disabled={busy} onClick={onClear}>
          {translate('finance:imports.bulk.clear')}
        </Button>
      </div>
    </div>
  )
}

export default ImportBulkBar
