import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Select from '../../../shared/components/Select/Select'
import type { CategoryResponseDto } from '../../types/CategoryDtos'
import type { MoneyFlowType } from '../../types/TransactionDtos'
import './ImportBulkBar.css'

const TYPES: MoneyFlowType[] = ['Expense', 'Income', 'Investment']

interface ImportBulkBarProps {
  count: number
  categories: CategoryResponseDto[]
  busy: boolean
  onSetCategory: (categoryId: number) => void
  onSetType: (type: MoneyFlowType) => void
  onSetIncluded: (included: boolean) => void
  onClear: () => void
}

/** What can be done to the selected rows at once: file them, change their type, include or leave them out. */
function ImportBulkBar({ count, categories, busy, onSetCategory, onSetType, onSetIncluded, onClear }: ImportBulkBarProps) {
  const { t: translate } = useTranslation('finance')

  return (
    <div className="lm-import-bulk" role="region" aria-label={translate('finance:imports.bulk.aria')}>
      <span className="lm-import-bulk__count" aria-live="polite">
        {translate('finance:imports.bulk.selected', { count })}
      </span>
      <div className="lm-import-bulk__controls">
        <Select
          size="sm"
          aria-label={translate('finance:imports.bulk.category')}
          options={[
            { value: '', label: translate('finance:imports.bulk.category') },
            ...categories.map((category) => ({ value: String(category.id), label: category.name })),
          ]}
          value=""
          disabled={busy}
          onChange={(event) => event.target.value && onSetCategory(Number(event.target.value))}
          containerClassName="lm-import-bulk__select"
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
