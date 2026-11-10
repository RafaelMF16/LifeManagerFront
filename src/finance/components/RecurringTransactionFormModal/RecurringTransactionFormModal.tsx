import { useId, useState } from 'react'
import { Controller, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Dialog from '../../../shared/components/Dialog/Dialog'
import IconButton from '../../../shared/components/IconButton/IconButton'
import Input from '../../../shared/components/Input/Input'
import SegmentedControl from '../../../shared/components/SegmentedControl/SegmentedControl'
import { useErrorModal } from '../../../shared/hooks/useErrorModal'
import { useZodForm } from '../../../shared/hooks/useZodForm'
import { isSessionExpiredError } from '../../../shared/services/httpClient'
import { isApiError } from '../../../shared/types/ApiError'
import { applyApiErrorToForm } from '../../../shared/utils/applyApiErrorToForm'
import type { RecurringTransactionResponseDto } from '../../types/RecurringTransactionDtos'
import type { MoneyFlowType } from '../../types/TransactionDtos'
import { toYearMonth } from '../../utils/yearMonth'
import { toFormAmount } from '../../validation/amountSchema'
import {
  RECURRING_TRANSACTION_CHANGED_CONCURRENTLY_CODE,
  recurringTransactionErrorFieldMap,
} from '../../validation/recurringTransactionErrorMap'
import {
  RECURRENCE_FIRST_DAY,
  RECURRENCE_LAST_DAY,
  createRecurringTransactionSchema,
} from '../../validation/recurringTransactionSchema'
import type { RecurringTransactionFormValues } from '../../validation/recurringTransactionSchema'
import { TRANSACTION_DESCRIPTION_MAX_LENGTH } from '../../validation/transactionSchema'
import CategoryPicker from '../CategoryPicker/CategoryPicker'
import MonthYearSelect from '../MonthYearSelect/MonthYearSelect'
import MoneyInput from '../MoneyInput/MoneyInput'
import './RecurringTransactionFormModal.css'

const TYPES: MoneyFlowType[] = ['Income', 'Expense', 'Investment']

interface RecurringTransactionFormModalProps {
  /** The recurrence being edited; omitted when creating a new one. */
  recurringTransaction?: RecurringTransactionResponseDto
  onClose: () => void
  /** Persists the values; a rejection is shown on the form and keeps the modal open. */
  onSubmit: (values: RecurringTransactionFormValues) => Promise<void>
}

/**
 * Whether the recurrence already posted (or skipped) its first month: from then on the backend keeps its start
 * month (`RecurringTransaction.StartLocked`), so the field is locked.
 */
function hasStarted(recurringTransaction: RecurringTransactionResponseDto) {
  const nextMonth = recurringTransaction.nextOccurrenceDate?.slice(0, 7)
  return nextMonth === undefined || nextMonth !== recurringTransaction.startMonth
}

function RecurringTransactionFormModal({
  recurringTransaction,
  onClose,
  onSubmit,
}: RecurringTransactionFormModalProps) {
  const { t: translate, i18n } = useTranslation(['finance', 'common'])
  const titleId = useId()
  const { show: showErrorModal } = useErrorModal()
  const isEditing = Boolean(recurringTransaction)
  const startLocked = recurringTransaction ? hasStarted(recurringTransaction) : false

  const currentMonth = toYearMonth(new Date())
  // Editing keeps a stored start that is in the past by now: it can't move earlier, but it may stay.
  const minStartMonth =
    recurringTransaction && recurringTransaction.startMonth < currentMonth ? recurringTransaction.startMonth : currentMonth
  const firstYear = Number(minStartMonth.slice(0, 4))

  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useZodForm(createRecurringTransactionSchema(minStartMonth), {
    defaultValues: {
      type: recurringTransaction?.type ?? 'Income',
      description: recurringTransaction?.description ?? '',
      amount: recurringTransaction ? toFormAmount(recurringTransaction.amount, i18n.language) : '',
      dayOfMonth: recurringTransaction ? String(recurringTransaction.dayOfMonth) : String(new Date().getDate()),
      categoryId: recurringTransaction ? String(recurringTransaction.categoryId) : '',
      startMonth: recurringTransaction?.startMonth ?? currentMonth,
      endMonth: recurringTransaction?.endMonth ?? '',
    },
  })
  const type = useWatch({ control, name: 'type' })
  const startMonth = useWatch({ control, name: 'startMonth' })
  const endMonth = useWatch({ control, name: 'endMonth' })

  const fieldError = (message: string | undefined) => (message ? translate(message) : undefined)

  // The picker shows the category's name, which the form value (an id) doesn't carry.
  const [categoryName, setCategoryName] = useState(recurringTransaction?.categoryName ?? '')

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch (err) {
      if (isSessionExpiredError(err)) return
      if (isApiError(err)) {
        // Posted by the background job while the form was open: the user only has to save again.
        const fallback =
          err.code === RECURRING_TRANSACTION_CHANGED_CONCURRENTLY_CODE ? 'finance:recurring.errors.changedConcurrently' : undefined
        applyApiErrorToForm(err, setError, recurringTransactionErrorFieldMap, translate, fallback)
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
            {translate(isEditing ? 'finance:recurring.form.editTitle' : 'finance:recurring.form.createTitle')}
          </h2>
          <IconButton icon="x" size="sm" label={translate('finance:actions.close')} onClick={onClose} />
        </div>

        <div className="lm-dialog__body">
          <div className="lm-recurring-form__fields">
            <div className="lm-recurring-form__type">
              <span className="lm-recurring-form__label" aria-hidden="true">
                {translate('finance:recurring.form.typeLabel')}
              </span>
              <SegmentedControl
                size="md"
                aria-label={translate('finance:recurring.form.typeLabel')}
                options={TYPES.map((option) => ({
                  value: option,
                  label: translate(`finance:recurring.form.typeOptions.${option}`),
                }))}
                value={type}
                onChange={(value) => setValue('type', value, { shouldValidate: true })}
                className="lm-recurring-form__type-control"
              />
            </div>

            <Input
              label={translate('finance:recurring.form.descriptionLabel')}
              placeholder={translate('finance:recurring.form.descriptionPlaceholder')}
              maxLength={TRANSACTION_DESCRIPTION_MAX_LENGTH}
              autoComplete="off"
              autoFocus
              error={fieldError(errors.description?.message)}
              {...register('description')}
            />

            <div className="lm-recurring-form__row">
              <MoneyInput
                label={translate('finance:recurring.form.amountLabel')}
                prefix={translate('finance:recurring.form.amountPrefix')}
                placeholder={translate('finance:recurring.form.amountPlaceholder')}
                error={fieldError(errors.amount?.message)}
                {...register('amount')}
              />
              <Input
                type="number"
                label={translate('finance:recurring.form.dayLabel')}
                hint={translate('finance:recurring.form.dayHint')}
                min={RECURRENCE_FIRST_DAY}
                max={RECURRENCE_LAST_DAY}
                inputMode="numeric"
                numeric
                error={fieldError(errors.dayOfMonth?.message)}
                {...register('dayOfMonth')}
              />
            </div>

            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <CategoryPicker
                  label={translate('finance:recurring.form.categoryLabel')}
                  value={field.value ? { id: Number(field.value), name: categoryName } : null}
                  onChange={(category) => {
                    setCategoryName(category?.name ?? '')
                    field.onChange(category ? String(category.id) : '')
                  }}
                  onBlur={field.onBlur}
                  inputRef={field.ref}
                  error={fieldError(errors.categoryId?.message)}
                />
              )}
            />

            <div className="lm-recurring-form__row">
              <MonthYearSelect
                label={translate('finance:recurring.form.startLabel')}
                value={startMonth}
                onChange={(value) => setValue('startMonth', value, { shouldValidate: true })}
                firstYear={firstYear}
                disabled={startLocked}
                hint={startLocked ? translate('finance:recurring.form.startLockedHint') : undefined}
                error={fieldError(errors.startMonth?.message)}
              />
              <MonthYearSelect
                label={translate('finance:recurring.form.endLabel')}
                value={endMonth}
                onChange={(value) => setValue('endMonth', value, { shouldValidate: true })}
                firstYear={firstYear}
                emptyLabel={translate('finance:recurring.form.noEnd')}
                error={fieldError(errors.endMonth?.message)}
              />
            </div>

            <p className="lm-recurring-form__hint">
              {translate(isEditing ? 'finance:recurring.form.editHint' : 'finance:recurring.form.postingHint')}
            </p>
          </div>

          {errors.root?.serverError?.message ? (
            <p className="lm-recurring-form__error" role="alert">
              {errors.root.serverError.message}
            </p>
          ) : null}
        </div>

        <div className="lm-dialog__footer">
          <Button variant="secondary" onClick={onClose}>
            {translate('finance:actions.cancel')}
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {translate(isEditing ? 'finance:recurring.form.save' : 'finance:recurring.form.create')}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

export default RecurringTransactionFormModal
