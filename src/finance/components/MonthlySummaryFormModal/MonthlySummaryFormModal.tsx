import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Dialog from '../../../shared/components/Dialog/Dialog'
import IconButton from '../../../shared/components/IconButton/IconButton'
import Select from '../../../shared/components/Select/Select'
import { useErrorModal } from '../../../shared/hooks/useErrorModal'
import { useZodForm } from '../../../shared/hooks/useZodForm'
import { isSessionExpiredError } from '../../../shared/services/httpClient'
import { isApiError } from '../../../shared/types/ApiError'
import { applyApiErrorToForm } from '../../../shared/utils/applyApiErrorToForm'
import { useFinanceFormat } from '../../hooks/useFinanceFormat'
import { monthlySummaryErrorFieldMap } from '../../validation/monthlySummaryErrorMap'
import {
  createMonthlySummarySchema,
  FIRST_MONTH,
  LAST_MONTH,
  monthlySummaryYears,
} from '../../validation/monthlySummarySchema'
import type { MonthlySummaryFormValues } from '../../validation/monthlySummarySchema'
import './MonthlySummaryFormModal.css'

interface MonthlySummaryFormModalProps {
  onClose: () => void
  /** Persists the month; a rejection is shown on the form and keeps the modal open. */
  onSubmit: (values: MonthlySummaryFormValues) => Promise<void>
}

const MONTHS = Array.from({ length: LAST_MONTH - FIRST_MONTH + 1 }, (_, index) => FIRST_MONTH + index)

/** Opens a month of the current year (the default) or of the previous one, the only years the backend accepts. */
function MonthlySummaryFormModal({ onClose, onSubmit }: MonthlySummaryFormModalProps) {
  const { t: translate } = useTranslation(['finance', 'common'])
  const titleId = useId()
  const { show: showErrorModal } = useErrorModal()
  const { monthName } = useFinanceFormat()
  const today = new Date()
  const currentYear = today.getFullYear()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useZodForm(createMonthlySummarySchema(currentYear), {
    defaultValues: { month: today.getMonth() + 1, year: currentYear },
  })

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch (err) {
      if (isSessionExpiredError(err)) return
      if (isApiError(err)) {
        applyApiErrorToForm(err, setError, monthlySummaryErrorFieldMap, translate)
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
            {translate('finance:months.form.title')}
          </h2>
          <IconButton icon="x" size="sm" label={translate('finance:actions.close')} onClick={onClose} />
        </div>

        <div className="lm-dialog__body">
          <div className="lm-month-form__fields">
            <Select
              label={translate('finance:months.form.monthLabel')}
              options={MONTHS.map((month) => ({ value: String(month), label: monthName(month) }))}
              autoFocus
              error={errors.month?.message ? translate(errors.month.message) : undefined}
              {...register('month', { valueAsNumber: true })}
            />
            <Select
              label={translate('finance:months.form.yearLabel')}
              options={monthlySummaryYears(currentYear).map((year) => ({ value: String(year), label: String(year) }))}
              error={errors.year?.message ? translate(errors.year.message) : undefined}
              {...register('year', { valueAsNumber: true })}
            />
          </div>

          {errors.root?.serverError?.message ? (
            <p className="lm-month-form__error" role="alert">
              {errors.root.serverError.message}
            </p>
          ) : null}
        </div>

        <div className="lm-dialog__footer">
          <Button variant="secondary" onClick={onClose}>
            {translate('finance:actions.cancel')}
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {translate('finance:months.form.create')}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

export default MonthlySummaryFormModal
