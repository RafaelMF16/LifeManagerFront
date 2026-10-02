import { useId } from 'react'
import { useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
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
import type { CategoryResponseDto } from '../../types/CategoryDtos'
import type { MoneyFlowType, TransactionResponseDto } from '../../types/TransactionDtos'
import { transactionErrorFieldMap } from '../../validation/transactionErrorMap'
import { TRANSACTION_DESCRIPTION_MAX_LENGTH, createTransactionSchema, monthDateRange } from '../../validation/transactionSchema'
import type { TransactionFormValues } from '../../validation/transactionSchema'
import './TransactionFormModal.css'

const TYPES: MoneyFlowType[] = ['Expense', 'Income']

interface TransactionFormModalProps {
  year: number
  month: number
  /** The transaction being edited; omitted when creating a new one. */
  transaction?: TransactionResponseDto
  categories: CategoryResponseDto[]
  categoriesStatus: CategoryOptionsStatus
  onClose: () => void
  /** Persists the values; a rejection is shown on the form and keeps the modal open. */
  onSubmit: (values: TransactionFormValues) => Promise<void>
}

/** Today when the month is the current one, otherwise its first day: the date must fall inside the month. */
function defaultDate(year: number, month: number) {
  const today = new Date()
  const { min } = monthDateRange(year, month)
  if (today.getFullYear() !== year || today.getMonth() + 1 !== month) return min

  return `${min.slice(0, 8)}${String(today.getDate()).padStart(2, '0')}`
}

function toFormAmount(amount: number, language: string) {
  return new Intl.NumberFormat(language, { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false }).format(amount)
}

function TransactionFormModal({
  year,
  month,
  transaction,
  categories,
  categoriesStatus,
  onClose,
  onSubmit,
}: TransactionFormModalProps) {
  const { t: translate, i18n } = useTranslation(['finance', 'common'])
  const titleId = useId()
  const { show: showErrorModal } = useErrorModal()
  const { periodLabel } = useFinanceFormat()
  const period = periodLabel(month, year)
  const { min, max } = monthDateRange(year, month)
  const isEditing = Boolean(transaction)

  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useZodForm(createTransactionSchema(year, month), {
    defaultValues: {
      type: transaction?.type ?? 'Expense',
      description: transaction?.description ?? '',
      amount: transaction ? toFormAmount(transaction.amount, i18n.language) : '',
      date: transaction?.date ?? defaultDate(year, month),
      categoryId: transaction ? String(transaction.categoryId) : '',
    },
  })
  const type = useWatch({ control, name: 'type' })

  // Some messages name the month ("The date must be in March 2026").
  const translateMessage = (key: string) => translate(key, { period })
  const fieldError = (message: string | undefined) => (message ? translateMessage(message) : undefined)

  // The edited transaction's category stays selectable even if it isn't among the loaded options.
  const categoryOptions = [
    { value: '', label: translate('finance:transactions.form.categoryPlaceholder') },
    ...categories.map((category) => ({ value: String(category.id), label: category.name })),
    ...(transaction && !categories.some((category) => category.id === transaction.categoryId)
      ? [{ value: String(transaction.categoryId), label: transaction.categoryName }]
      : []),
  ]
  const hasNoCategories = categoriesStatus === 'ready' && categories.length === 0 && !transaction

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch (err) {
      if (isSessionExpiredError(err)) return
      if (isApiError(err)) {
        applyApiErrorToForm(err, setError, transactionErrorFieldMap, translateMessage)
      } else {
        showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
      }
    }
  })

  function renderCategoryField() {
    if (categoriesStatus === 'loading' && !transaction) {
      return <p className="lm-transaction-form__note">{translate('finance:transactions.form.categoriesLoading')}</p>
    }

    if (hasNoCategories) {
      return (
        <div className="lm-transaction-form__note">
          <span>{translate('finance:transactions.form.noCategories')}</span>
          <Link to="/finance/categories">{translate('finance:transactions.form.createCategory')}</Link>
        </div>
      )
    }

    return (
      <Select
        label={translate('finance:transactions.form.categoryLabel')}
        options={categoryOptions}
        hint={categoriesStatus === 'error' ? translate('finance:transactions.form.categoriesError') : undefined}
        error={fieldError(errors.categoryId?.message)}
        {...register('categoryId')}
      />
    )
  }

  return (
    <Dialog labelledBy={titleId} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <div className="lm-dialog__header">
          <div className="lm-transaction-form__heading">
            <h2 id={titleId} className="lm-dialog__title">
              {translate(isEditing ? 'finance:transactions.form.editTitle' : 'finance:transactions.form.createTitle')}
            </h2>
            <span className="lm-transaction-form__period">{period}</span>
          </div>
          <IconButton icon="x" size="sm" label={translate('finance:actions.close')} onClick={onClose} />
        </div>

        <div className="lm-dialog__body">
          <div className="lm-transaction-form__fields">
            <div className="lm-transaction-form__type">
              <span className="lm-transaction-form__label" aria-hidden="true">
                {translate('finance:transactions.form.typeLabel')}
              </span>
              <SegmentedControl
                size="md"
                aria-label={translate('finance:transactions.form.typeLabel')}
                options={TYPES.map((option) => ({
                  value: option,
                  label: translate(`finance:transactions.form.typeOptions.${option}`),
                }))}
                value={type}
                onChange={(value) => setValue('type', value, { shouldValidate: true })}
                className="lm-transaction-form__type-control"
              />
            </div>

            <Input
              label={translate('finance:transactions.form.descriptionLabel')}
              placeholder={translate('finance:transactions.form.descriptionPlaceholder')}
              maxLength={TRANSACTION_DESCRIPTION_MAX_LENGTH}
              autoComplete="off"
              autoFocus
              error={fieldError(errors.description?.message)}
              {...register('description')}
            />

            <div className="lm-transaction-form__row">
              <Input
                label={translate('finance:transactions.form.amountLabel')}
                prefix={translate('finance:transactions.form.amountPrefix')}
                placeholder={translate('finance:transactions.form.amountPlaceholder')}
                inputMode="decimal"
                autoComplete="off"
                numeric
                error={fieldError(errors.amount?.message)}
                {...register('amount')}
              />
              <Input
                type="date"
                label={translate('finance:transactions.form.dateLabel')}
                min={min}
                max={max}
                error={fieldError(errors.date?.message)}
                {...register('date')}
              />
            </div>

            {renderCategoryField()}
          </div>

          {errors.root?.serverError?.message ? (
            <p className="lm-transaction-form__error" role="alert">
              {errors.root.serverError.message}
            </p>
          ) : null}
        </div>

        <div className="lm-dialog__footer">
          <Button variant="secondary" onClick={onClose}>
            {translate('finance:actions.cancel')}
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting} disabled={hasNoCategories}>
            {translate(isEditing ? 'finance:transactions.form.save' : 'finance:transactions.form.create')}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

export default TransactionFormModal
