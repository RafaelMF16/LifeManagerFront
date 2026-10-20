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
import { useFinanceFormat } from '../../hooks/useFinanceFormat'
import type { CategoryResponseDto } from '../../types/CategoryDtos'
import type { StatementImportRowDto } from '../../types/StatementImportDtos'
import type { MoneyFlowType } from '../../types/TransactionDtos'
import { nextMonthOf } from '../../utils/statementImport/monthShift'
import { todayIso } from '../../utils/statementImport/statementLines'
import { parseYearMonth } from '../../utils/yearMonth'
import { toFormAmount } from '../../validation/amountSchema'
import { IMPORT_ROW_MIN_DATE, createImportRowSchema } from '../../validation/importRowSchema'
import type { ImportRowFormValues } from '../../validation/importRowSchema'
import { importRowErrorFieldMap } from '../../validation/statementImportErrorMap'
import { TRANSACTION_DESCRIPTION_MAX_LENGTH } from '../../validation/transactionSchema'
import './ImportRowFormModal.css'

const TYPES: MoneyFlowType[] = ['Expense', 'Income', 'Investment']

interface ImportRowFormModalProps {
  row: StatementImportRowDto
  categories: CategoryResponseDto[]
  onClose: () => void
  /** Saves the row; a rejection is shown on the form and keeps the modal open. */
  onSubmit: (values: ImportRowFormValues) => Promise<void>
}

/**
 * Edits every field of a statement line before it is imported: unlike a transaction, its date may move to any
 * month (from 2000 to today), and the category may stay empty for now. "Count in the next month" keeps the bank's
 * date but posts it on the 1st of the next month; changing the date unticks it, so the user decides again.
 */
function ImportRowFormModal({ row, categories, onClose, onSubmit }: ImportRowFormModalProps) {
  const { t: translate, i18n } = useTranslation(['finance', 'common'])
  const titleId = useId()
  const { show: showErrorModal } = useErrorModal()
  const { periodLabel } = useFinanceFormat()
  const today = todayIso()

  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useZodForm(createImportRowSchema(today), {
    defaultValues: {
      type: row.type,
      description: row.description,
      amount: toFormAmount(row.amount, i18n.language),
      date: row.date,
      categoryId: row.categoryId === null ? '' : String(row.categoryId),
      included: row.included,
      shiftToNextMonth: row.shiftToNextMonth,
    },
  })
  const type = useWatch({ control, name: 'type' })
  const date = useWatch({ control, name: 'date' })
  const shiftToNextMonth = useWatch({ control, name: 'shiftToNextMonth' })
  const shiftedMonth = parseYearMonth(nextMonthOf(date))

  const fieldError = (message: string | undefined) => (message ? translate(message) : undefined)

  const categoryOptions = [
    { value: '', label: translate('finance:imports.rows.categoryPlaceholder') },
    ...categories.map((category) => ({ value: String(category.id), label: category.name })),
    ...(row.categoryId !== null && !categories.some((category) => category.id === row.categoryId)
      ? [{ value: String(row.categoryId), label: row.categoryName ?? '' }]
      : []),
  ]

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch (err) {
      if (isSessionExpiredError(err)) return
      if (isApiError(err)) {
        applyApiErrorToForm(err, setError, importRowErrorFieldMap, translate)
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
            {translate('finance:imports.rowForm.title')}
          </h2>
          <IconButton icon="x" size="sm" label={translate('finance:actions.close')} onClick={onClose} />
        </div>

        <div className="lm-dialog__body">
          <div className="lm-import-row-form__fields">
            <div className="lm-import-row-form__original">
              <span className="lm-import-row-form__label">{translate('finance:imports.rowForm.original')}</span>
              <span className="lm-import-row-form__original-text">{row.originalDescription}</span>
            </div>

            <div className="lm-import-row-form__type">
              <span className="lm-import-row-form__label" aria-hidden="true">
                {translate('finance:transactions.form.typeLabel')}
              </span>
              <SegmentedControl
                size="md"
                aria-label={translate('finance:transactions.form.typeLabel')}
                options={TYPES.map((option) => ({ value: option, label: translate(`finance:transactions.form.typeOptions.${option}`) }))}
                value={type}
                onChange={(value) => setValue('type', value, { shouldValidate: true })}
                className="lm-import-row-form__type-control"
              />
            </div>

            <Input
              label={translate('finance:transactions.form.descriptionLabel')}
              maxLength={TRANSACTION_DESCRIPTION_MAX_LENGTH}
              autoComplete="off"
              error={fieldError(errors.description?.message)}
              {...register('description')}
            />

            <div className="lm-import-row-form__row">
              <Input
                label={translate('finance:transactions.form.amountLabel')}
                prefix={translate('finance:transactions.form.amountPrefix')}
                inputMode="decimal"
                autoComplete="off"
                numeric
                error={fieldError(errors.amount?.message)}
                {...register('amount')}
              />
              <Input
                type="date"
                label={translate('finance:transactions.form.dateLabel')}
                min={IMPORT_ROW_MIN_DATE}
                max={today}
                error={fieldError(errors.date?.message)}
                {...register('date', { onChange: () => setValue('shiftToNextMonth', false) })}
              />
            </div>

            <Select
              label={translate('finance:transactions.form.categoryLabel')}
              options={categoryOptions}
              error={fieldError(errors.categoryId?.message)}
              {...register('categoryId')}
            />

            <label className="lm-import-row-form__check">
              <input type="checkbox" {...register('included')} />
              {translate('finance:imports.rowForm.included')}
            </label>

            <div className="lm-import-row-form__shift">
              <label className="lm-import-row-form__check">
                <input type="checkbox" aria-describedby={`${titleId}-shift`} {...register('shiftToNextMonth')} />
                {translate('finance:imports.rowForm.shiftToNextMonth')}
              </label>
              <span id={`${titleId}-shift`} className="lm-import-row-form__hint">
                {shiftToNextMonth && shiftedMonth
                  ? translate('finance:imports.rowForm.shiftHintOn', { month: periodLabel(shiftedMonth.month, shiftedMonth.year) })
                  : translate('finance:imports.rowForm.shiftHintOff')}
              </span>
            </div>
          </div>

          {errors.root?.serverError?.message ? (
            <p className="lm-import-row-form__error" role="alert">
              {errors.root.serverError.message}
            </p>
          ) : null}
        </div>

        <div className="lm-dialog__footer">
          <Button variant="secondary" onClick={onClose}>
            {translate('finance:actions.cancel')}
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {translate('finance:imports.rowForm.save')}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

export default ImportRowFormModal
