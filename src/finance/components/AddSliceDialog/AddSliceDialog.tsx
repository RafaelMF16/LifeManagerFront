import { useId, useState } from 'react'
import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import Dialog from '../../../shared/components/Dialog/Dialog'
import Icon from '../../../shared/components/Icon/Icon'
import IconButton from '../../../shared/components/IconButton/IconButton'
import Input from '../../../shared/components/Input/Input'
import type { CategoryOptionsStatus } from '../../hooks/useCategoryOptions'
import type { CategoryResponseDto } from '../../types/CategoryDtos'
import { sliceOptions } from '../../utils/budgetPlan'
import type { DraftSlice } from '../../utils/budgetPlan'
import './AddSliceDialog.css'

interface AddSliceDialogProps {
  categories: CategoryResponseDto[]
  categoriesStatus: CategoryOptionsStatus
  /** The draft's slices: what is already in the plan isn't offered again. */
  slices: DraftSlice[]
  /** Called with the new slice at 0%; the dialog closes itself through `onClose`. */
  onAdd: (slice: DraftSlice) => void
  onClose: () => void
}

/** Picks what to add to the plan: the investment slice (first, while there is none) or a category without a slice. */
function AddSliceDialog({ categories, categoriesStatus, slices, onAdd, onClose }: AddSliceDialogProps) {
  const { t: translate } = useTranslation('finance')
  const titleId = useId()
  const [search, setSearch] = useState('')

  const investmentLabel = translate('finance:budgetPlan.investment')
  const options = sliceOptions(categories, slices, search, investmentLabel)
  const nothingLeft = options.categories.length === 0 && !options.investment

  function add(slice: DraftSlice) {
    onAdd(slice)
    onClose()
  }

  function renderStatus() {
    if (categoriesStatus === 'loading') return <p className="lm-add-slice__state">{translate('finance:budgetPlan.add.loading')}</p>
    if (categoriesStatus === 'error') return <p className="lm-add-slice__state">{translate('finance:budgetPlan.add.loadError')}</p>
    if (!nothingLeft) return null

    return (
      <p className="lm-add-slice__state">
        {search.trim() === '' ? translate('finance:budgetPlan.add.empty') : translate('finance:budgetPlan.add.noResults')}
      </p>
    )
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
        <Input
          icon="search"
          placeholder={translate('finance:budgetPlan.add.search')}
          aria-label={translate('finance:budgetPlan.add.search')}
          value={search}
          autoComplete="off"
          onChange={(event) => setSearch(event.target.value)}
        />

        <ul className="lm-add-slice__options">
          {options.investment ? (
            <li>
              <button
                type="button"
                className="lm-add-slice__option"
                onClick={() => add({ type: 'Investment', categoryId: null, categoryName: null, percent: 0 })}
              >
                <span className="lm-add-slice__swatch" style={{ '--lm-slice-color': 'var(--chart-investment)' } as CSSProperties} aria-hidden="true" />
                <span className="lm-add-slice__option-text">
                  <span className="lm-add-slice__option-name">{investmentLabel}</span>
                  <span className="lm-add-slice__option-hint">{translate('finance:budgetPlan.add.investmentHint')}</span>
                </span>
                <Icon name="plus" aria-hidden="true" />
              </button>
            </li>
          ) : null}
          {options.categories.map((category) => (
            <li key={category.id}>
              <button
                type="button"
                className="lm-add-slice__option"
                onClick={() => add({ type: 'Expense', categoryId: category.id, categoryName: category.name, percent: 0 })}
              >
                <span className="lm-add-slice__swatch lm-add-slice__swatch--category" aria-hidden="true" />
                <span className="lm-add-slice__option-text">
                  <span className="lm-add-slice__option-name">{category.name}</span>
                </span>
                <Icon name="plus" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>

        {renderStatus()}
      </div>
    </Dialog>
  )
}

export default AddSliceDialog
