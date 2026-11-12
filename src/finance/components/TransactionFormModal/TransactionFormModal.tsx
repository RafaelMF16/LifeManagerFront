import { useId, useState } from 'react'
import { Controller, useWatch } from 'react-hook-form'
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
import { useLinkableSavingsGoals } from '../../hooks/useLinkableSavingsGoals'
import type { MoneyFlowType, TransactionResponseDto } from '../../types/TransactionDtos'
import { savingsGoalOptions } from '../../utils/savingsGoal'
import { toFormAmount } from '../../validation/amountSchema'
import { quickTransactionErrorFieldMap, transactionErrorFieldMap } from '../../validation/transactionErrorMap'
import {
  QUICK_TRANSACTION_MIN_DATE,
  TRANSACTION_DESCRIPTION_MAX_LENGTH,
  createQuickTransactionSchema,
  createTransactionSchema,
  monthDateRange,
  quickTransactionMaxDate,
} from '../../validation/transactionSchema'
import type { TransactionFormValues } from '../../validation/transactionSchema'
import CategoryPicker from '../CategoryPicker/CategoryPicker'
import MoneyInput from '../MoneyInput/MoneyInput'
import './TransactionFormModal.css'

const TYPES: MoneyFlowType[] = ['Expense', 'Income', 'Investment']

interface CommonProps {
  /** The transaction being edited; omitted when creating a new one. */
  transaction?: TransactionResponseDto
  onClose: () => void
  /** Persists the values; a rejection is shown on the form and keeps the modal open. */
  onSubmit: (values: TransactionFormValues) => Promise<void>
}

/**
 * `month` (default): a transaction of that month, whose date must fall inside it. `quick`: a new transaction with no
 * month, dated anywhere from 2000 to the end of this year; the backend puts it in the month of its date.
 */
type TransactionFormModalProps = CommonProps & ({ mode?: 'month'; year: number; month: number } | { mode: 'quick' })

const ISO_DATE = /^(\d{4})-(\d{2})-\d{2}$/

function todayIso() {
  const today = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
}

/** Today when the month is the current one, otherwise its first day: the date must fall inside the month. */
function defaultDate(year: number, month: number) {
  const today = todayIso()
  const { min, max } = monthDateRange(year, month)
  return today >= min && today <= max ? today : min
}

function TransactionFormModal(props: TransactionFormModalProps) {
  const { transaction, onClose, onSubmit } = props
  const isQuick = props.mode === 'quick'
  const { t: translate, i18n } = useTranslation(['finance', 'common'])
  const titleId = useId()
  const { show: showErrorModal } = useErrorModal()
  const { periodLabel } = useFinanceFormat()
  const { min, max } = isQuick
    ? { min: QUICK_TRANSACTION_MIN_DATE, max: quickTransactionMaxDate(new Date().getFullYear()) }
    : monthDateRange(props.year, props.month)
  const isEditing = Boolean(transaction)

  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useZodForm(isQuick ? createQuickTransactionSchema(min, max) : createTransactionSchema(props.year, props.month), {
    defaultValues: {
      type: transaction?.type ?? 'Expense',
      description: transaction?.description ?? '',
      amount: transaction ? toFormAmount(transaction.amount, i18n.language) : '',
      date: transaction?.date ?? (isQuick ? todayIso() : defaultDate(props.year, props.month)),
      categoryId: transaction ? String(transaction.categoryId) : '',
      savingsGoalId: transaction?.savingsGoalId != null ? String(transaction.savingsGoalId) : '',
    },
  })
  const type = useWatch({ control, name: 'type' })
  const savingsGoalId = useWatch({ control, name: 'savingsGoalId' })
  const isInvestment = type === 'Investment'
  const linkableGoals = useLinkableSavingsGoals(isInvestment)
  const currentGoal = transaction ? { id: transaction.savingsGoalId, name: transaction.savingsGoalName } : null
  // While the goals load, the transaction's own goal is the only option, so the select already shows it.
  const goalOptions =
    linkableGoals === null
      ? currentGoal?.id != null
        ? [{ id: currentGoal.id, name: currentGoal.name ?? '', archived: false }]
        : []
      : savingsGoalOptions(linkableGoals, currentGoal)
  const date = useWatch({ control, name: 'date' })

  // The month the transaction goes to: fixed, or (quick) the month of the date typed so far.
  const dateMatch = isQuick ? ISO_DATE.exec(date) : null
  const period = isQuick
    ? dateMatch
      ? periodLabel(Number(dateMatch[2]), Number(dateMatch[1]))
      : ''
    : periodLabel(props.month, props.year)

  // Some messages name the month ("The date must be in March 2026").
  const translateMessage = (key: string) => translate(key, { period })
  const fieldError = (message: string | undefined) => (message ? translateMessage(message) : undefined)

  // The picker shows the category's name, which the form value (an id) doesn't carry.
  const [categoryName, setCategoryName] = useState(transaction?.categoryName ?? '')

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch (err) {
      if (isSessionExpiredError(err)) return
      if (isApiError(err)) {
        applyApiErrorToForm(
          err,
          setError,
          isQuick ? quickTransactionErrorFieldMap : transactionErrorFieldMap,
          translateMessage,
        )
      } else {
        showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
      }
    }
  })

  return (
    <Dialog labelledBy={titleId} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <div className="lm-dialog__header">
          <div className="lm-transaction-form__heading">
            <h2 id={titleId} className="lm-dialog__title">
              {translate(isEditing ? 'finance:transactions.form.editTitle' : 'finance:transactions.form.createTitle')}
            </h2>
            {period ? <span className="lm-transaction-form__period">{period}</span> : null}
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
                onChange={(value) => {
                  setValue('type', value, { shouldValidate: true })
                  // Only an investment counts towards a goal: another type drops it, so it's never sent.
                  if (value !== 'Investment') setValue('savingsGoalId', '', { shouldValidate: true })
                }}
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
              <MoneyInput
                label={translate('finance:transactions.form.amountLabel')}
                prefix={translate('finance:transactions.form.amountPrefix')}
                placeholder={translate('finance:transactions.form.amountPlaceholder')}
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

            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <CategoryPicker
                  label={translate('finance:transactions.form.categoryLabel')}
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

            {isInvestment ? (
              <Select
                label={translate('finance:transactions.form.goalLabel')}
                hint={translate('finance:transactions.form.goalHint')}
                options={[
                  { value: '', label: translate('finance:transactions.form.goalNone') },
                  ...goalOptions.map((option) => ({
                    value: String(option.id),
                    label: option.archived
                      ? translate('finance:transactions.form.goalArchived', { name: option.name })
                      : option.name,
                  })),
                ]}
                value={savingsGoalId ?? ''}
                disabled={linkableGoals === null}
                onChange={(event) => setValue('savingsGoalId', event.target.value, { shouldValidate: true, shouldDirty: true })}
                error={fieldError(errors.savingsGoalId?.message)}
              />
            ) : null}
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
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {translate(isEditing ? 'finance:transactions.form.save' : 'finance:transactions.form.create')}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

export default TransactionFormModal
