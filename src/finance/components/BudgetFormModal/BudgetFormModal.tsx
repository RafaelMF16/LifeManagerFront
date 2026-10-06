import { useId } from 'react'
import { useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Dialog from '../../../shared/components/Dialog/Dialog'
import IconButton from '../../../shared/components/IconButton/IconButton'
import Input from '../../../shared/components/Input/Input'
import SegmentedControl from '../../../shared/components/SegmentedControl/SegmentedControl'
import Select from '../../../shared/components/Select/Select'
import { useErrorModal } from '../../../shared/hooks/useErrorModal'
import { useZodForm } from '../../../shared/hooks/useZodForm'
import { isSessionExpiredError } from '../../../shared/services/httpClient'
import { isApiError } from '../../../shared/types/ApiError'
import { applyApiErrorToForm } from '../../../shared/utils/applyApiErrorToForm'
import type { CategoryOptionsStatus } from '../../hooks/useCategoryOptions'
import { useFinanceFormat } from '../../hooks/useFinanceFormat'
import type { BudgetProgressDto, BudgetType } from '../../types/BudgetDtos'
import type { CategoryResponseDto } from '../../types/CategoryDtos'
import { parseYearMonth } from '../../utils/yearMonth'
import { toFormAmount } from '../../validation/amountSchema'
import { budgetErrorFieldMap } from '../../validation/budgetErrorMap'
import { budgetSchema } from '../../validation/budgetSchema'
import type { BudgetFormValues } from '../../validation/budgetSchema'
import MonthYearSelect from '../MonthYearSelect/MonthYearSelect'
import './BudgetFormModal.css'

const TYPES: BudgetType[] = ['Expense', 'Investment']

/** How many years before the viewed month the "from" select still offers. */
const YEARS_BEFORE = 1

interface BudgetFormModalProps {
  type: BudgetType
  /** The goal being changed; omitted when creating one. Its type and category stay fixed. */
  budget?: BudgetProgressDto
  /** The month on screen (`yyyy-MM`): the change applies from it by default. */
  month: string
  categories: CategoryResponseDto[]
  categoriesStatus: CategoryOptionsStatus
  onClose: () => void
  /** Persists the values; a rejection is shown on the form and keeps the modal open. */
  onSubmit: (values: BudgetFormValues) => Promise<void>
}

function BudgetFormModal({ type, budget, month, categories, categoriesStatus, onClose, onSubmit }: BudgetFormModalProps) {
  const { t: translate, i18n } = useTranslation(['finance', 'common'])
  const titleId = useId()
  const { show: showErrorModal } = useErrorModal()
  const { periodLabel } = useFinanceFormat()
  const isEditing = Boolean(budget)
  const firstYear = (parseYearMonth(month)?.year ?? new Date().getFullYear()) - YEARS_BEFORE

  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useZodForm(budgetSchema, {
    defaultValues: {
      type,
      categoryId: budget?.categoryId === null || budget?.categoryId === undefined ? '' : String(budget.categoryId),
      amount: budget ? toFormAmount(budget.goal, i18n.language) : '',
      from: month,
    },
  })
  const selectedType = useWatch({ control, name: 'type' })
  const from = useWatch({ control, name: 'from' })
  const fromParsed = parseYearMonth(from)

  const fieldError = (message: string | undefined) => (message ? translate(message) : undefined)

  // The goal's category stays selectable even if it isn't among the loaded options.
  const categoryOptions = [
    { value: '', label: translate('finance:budgets.form.totalOption') },
    ...categories.map((category) => ({ value: String(category.id), label: category.name })),
    ...(budget?.categoryId != null && !categories.some((category) => category.id === budget.categoryId)
      ? [{ value: String(budget.categoryId), label: budget.categoryName ?? '' }]
      : []),
  ]

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch (err) {
      if (isSessionExpiredError(err)) return
      if (isApiError(err)) {
        applyApiErrorToForm(err, setError, budgetErrorFieldMap, translate)
      } else {
        showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
      }
    }
  })

  return (
    <Dialog labelledBy={titleId} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <div className="lm-dialog__header">
          <h2 id={titleId} className="lm-dialog__title">
            {translate(isEditing ? 'finance:budgets.form.editTitle' : 'finance:budgets.form.createTitle')}
          </h2>
          <IconButton icon="x" size="sm" label={translate('finance:actions.close')} onClick={onClose} />
        </div>

        <div className="lm-dialog__body">
          <div className="lm-budget-form__fields">
            {isEditing ? (
              <div className="lm-budget-form__fixed">
                <span className="lm-budget-form__label">{translate('finance:budgets.form.goalLabel')}</span>
                <span className="lm-budget-form__fixed-value">
                  {translate(`finance:budgets.form.typeOptions.${type}`)} · {budget?.categoryName ?? translate('finance:budgets.total')}
                </span>
              </div>
            ) : (
              <>
                <div className="lm-budget-form__type">
                  <span className="lm-budget-form__label" aria-hidden="true">
                    {translate('finance:budgets.form.typeLabel')}
                  </span>
                  <SegmentedControl
                    size="md"
                    aria-label={translate('finance:budgets.form.typeLabel')}
                    options={TYPES.map((option) => ({
                      value: option,
                      label: translate(`finance:budgets.form.typeOptions.${option}`),
                    }))}
                    value={selectedType}
                    onChange={(value) => setValue('type', value, { shouldValidate: true })}
                    className="lm-budget-form__type-control"
                  />
                  <span className="lm-budget-form__type-hint">{translate(`finance:budgets.form.typeHints.${selectedType}`)}</span>
                </div>

                <Select
                  label={translate('finance:budgets.form.categoryLabel')}
                  options={categoryOptions}
                  hint={
                    categoriesStatus === 'error'
                      ? translate('finance:budgets.form.categoriesError')
                      : categoriesStatus === 'loading'
                        ? translate('finance:budgets.form.categoriesLoading')
                        : undefined
                  }
                  error={fieldError(errors.categoryId?.message)}
                  {...register('categoryId')}
                />
              </>
            )}

            <div className="lm-budget-form__row">
              <Input
                label={translate('finance:budgets.form.amountLabel')}
                prefix={translate('finance:budgets.form.amountPrefix')}
                placeholder={translate('finance:budgets.form.amountPlaceholder')}
                inputMode="decimal"
                autoComplete="off"
                numeric
                autoFocus
                error={fieldError(errors.amount?.message)}
                {...register('amount')}
              />
              <MonthYearSelect
                label={translate('finance:budgets.form.fromLabel')}
                value={from}
                onChange={(value) => setValue('from', value, { shouldValidate: true })}
                firstYear={firstYear}
                error={fieldError(errors.from?.message)}
              />
            </div>

            {fromParsed ? (
              <p className="lm-budget-form__hint">
                {translate('finance:budgets.form.effectiveHint', { month: periodLabel(fromParsed.month, fromParsed.year) })}
              </p>
            ) : null}
          </div>

          {errors.root?.serverError?.message ? (
            <p className="lm-budget-form__error" role="alert">
              {errors.root.serverError.message}
            </p>
          ) : null}
        </div>

        <div className="lm-dialog__footer">
          <Button variant="secondary" onClick={onClose}>
            {translate('finance:actions.cancel')}
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {translate(isEditing ? 'finance:budgets.form.save' : 'finance:budgets.form.create')}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

export default BudgetFormModal
