import { useId } from 'react'
import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import Dialog from '../../../shared/components/Dialog/Dialog'
import Icon from '../../../shared/components/Icon/Icon'
import IconButton from '../../../shared/components/IconButton/IconButton'
import { sliceOptions } from '../../utils/budgetPlan'
import type { DraftSlice } from '../../utils/budgetPlan'
import CategoryPicker from '../CategoryPicker/CategoryPicker'
import './AddSliceDialog.css'

interface AddSliceDialogProps {
  /** The draft's slices: what is already in the plan isn't offered again. */
  slices: DraftSlice[]
  /** Called with the new slice at 0%; the dialog closes itself through `onClose`. */
  onAdd: (slice: DraftSlice) => void
  onClose: () => void
}

/**
 * Picks what to add to the plan: the investment slice (first, while there is none) or a category without a slice,
 * searched with the category picker.
 */
function AddSliceDialog({ slices, onAdd, onClose }: AddSliceDialogProps) {
  const { t: translate } = useTranslation('finance')
  const titleId = useId()
  const options = sliceOptions(slices)

  function add(slice: DraftSlice) {
    onAdd(slice)
    onClose()
  }

  return (
    <Dialog labelledBy={titleId} onClose={onClose}>
      <div className="lm-dialog__header">
        <h2 id={titleId} className="lm-dialog__title">
          {translate('finance:budgetPlan.add.title')}
        </h2>
        <IconButton icon="x" size="sm" label={translate('finance:actions.close')} onClick={onClose} />
      </div>

      <div className="lm-dialog__body lm-add-slice">
        {options.investment ? (
          <button
            type="button"
            className="lm-add-slice__option"
            onClick={() => add({ type: 'Investment', categoryId: null, categoryName: null, percent: 0 })}
          >
            <span className="lm-add-slice__swatch" style={{ '--lm-slice-color': 'var(--chart-investment)' } as CSSProperties} aria-hidden="true" />
            <span className="lm-add-slice__option-text">
              <span className="lm-add-slice__option-name">{translate('finance:budgetPlan.investment')}</span>
              <span className="lm-add-slice__option-hint">{translate('finance:budgetPlan.add.investmentHint')}</span>
            </span>
            <Icon name="plus" aria-hidden="true" />
          </button>
        ) : null}

        <CategoryPicker
          label={translate('finance:budgetPlan.add.categoryLabel')}
          value={null}
          excludeIds={options.excludedCategoryIds}
          allExcludedLabel={translate('finance:budgetPlan.add.allInBudget')}
          onChange={(category) => {
            if (category) add({ type: 'Expense', categoryId: category.id, categoryName: category.name, percent: 0 })
          }}
        />
      </div>
    </Dialog>
  )
}

export default AddSliceDialog
