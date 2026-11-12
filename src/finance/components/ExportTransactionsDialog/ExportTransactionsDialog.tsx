import { useEffect, useId, useRef } from 'react'
import { useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Dialog from '../../../shared/components/Dialog/Dialog'
import IconButton from '../../../shared/components/IconButton/IconButton'
import Select from '../../../shared/components/Select/Select'
import { useErrorModal } from '../../../shared/hooks/useErrorModal'
import { useToast } from '../../../shared/hooks/useToast'
import { useZodForm } from '../../../shared/hooks/useZodForm'
import { isAbortError, isSessionExpiredError } from '../../../shared/services/httpClient'
import { isApiError } from '../../../shared/types/ApiError'
import { applyApiErrorToForm } from '../../../shared/utils/applyApiErrorToForm'
import { exportTransactions } from '../../services/transactionService'
import { defaultExportPeriod, exportFormatFor } from '../../utils/exportQuery'
import { EXPORT_TOO_MANY_REQUESTS_CODE, exportErrorFieldMap } from '../../validation/exportErrorMap'
import { EXPORT_FORMATS, EXPORT_TYPES, exportSchema } from '../../validation/exportSchema'
import type { ExportFormValues } from '../../validation/exportSchema'
import MonthYearSelect from '../MonthYearSelect/MonthYearSelect'
import './ExportTransactionsDialog.css'

/** How many years back the month selects offer, ending on the current one. */
const YEARS_BACK = 10

interface ExportTransactionsDialogProps {
  onClose: () => void
  /** The period to start with (`yyyy-MM`), e.g. the dashboard's; the last 12 months otherwise. */
  initialPeriod?: { from: string; to: string }
}

/** Downloads a period's transactions as a CSV spreadsheet, built by the backend. */
function ExportTransactionsDialog({ onClose, initialPeriod }: ExportTransactionsDialogProps) {
  const { t: translate, i18n } = useTranslation(['finance', 'common'])
  const titleId = useId()
  const { show: showToast } = useToast()
  const { show: showErrorModal } = useErrorModal()
  const abortRef = useRef<AbortController | null>(null)
  const today = new Date()
  const period = initialPeriod ?? defaultExportPeriod(today)
  // The selects run from here through the current year; an older chosen year stays selectable (MonthYearSelect).
  const firstYear = today.getFullYear() - YEARS_BACK

  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useZodForm(exportSchema, {
    defaultValues: { from: period.from, to: period.to, type: 'All', format: exportFormatFor(i18n.language) },
  })
  const from = useWatch({ control, name: 'from' })
  const to = useWatch({ control, name: 'to' })

  // Closing the dialog cancels a download still running.
  useEffect(() => () => abortRef.current?.abort(), [])

  // Both ends at once: the order and the 36-month cap depend on the pair, and their errors sit on `to`.
  function changeMonth(field: 'from' | 'to', value: string) {
    setValue(field, value)
    void trigger(['from', 'to'])
  }

  const fieldError = (message: string | undefined) => (message ? translate(message) : undefined)

  async function download(values: ExportFormValues) {
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const { rowCount } = await exportTransactions(values, controller.signal)
      if (rowCount === 0) {
        showToast(translate('finance:export.empty'))
        return
      }

      showToast(translate('finance:export.downloaded'))
      onClose()
    } catch (err) {
      if (isAbortError(err) || isSessionExpiredError(err)) return
      if (isApiError(err) && err.code === EXPORT_TOO_MANY_REQUESTS_CODE) {
        setError('root.serverError', { type: 'server', message: translate('finance:export.tooManyRequests') })
      } else if (isApiError(err)) {
        applyApiErrorToForm(err, setError, exportErrorFieldMap, translate)
      } else {
        showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
      }
    }
  }

  return (
    <Dialog labelledBy={titleId} onClose={onClose}>
      <form onSubmit={(event) => void handleSubmit(download)(event)} noValidate>
        <div className="lm-dialog__header">
          <h2 id={titleId} className="lm-dialog__title">
            {translate('finance:export.title')}
          </h2>
          <IconButton icon="x" size="sm" label={translate('finance:actions.close')} onClick={onClose} />
        </div>

        <div className="lm-dialog__body">
          <p className="lm-export-form__intro">{translate('finance:export.description')}</p>

          <div className="lm-export-form__period">
            <MonthYearSelect
              label={translate('finance:export.fromLabel')}
              value={from}
              onChange={(value) => changeMonth('from', value)}
              firstYear={firstYear}
              error={fieldError(errors.from?.message)}
            />
            <MonthYearSelect
              label={translate('finance:export.toLabel')}
              value={to}
              onChange={(value) => changeMonth('to', value)}
              firstYear={firstYear}
              error={fieldError(errors.to?.message)}
            />
          </div>

          <div className="lm-export-form__options">
            <Select
              label={translate('finance:export.typeLabel')}
              options={EXPORT_TYPES.map((type) => ({ value: type, label: translate(`finance:export.types.${type}`) }))}
              {...register('type')}
            />
            <Select
              label={translate('finance:export.formatLabel')}
              options={EXPORT_FORMATS.map((format) => ({ value: format, label: translate(`finance:export.formats.${format}`) }))}
              hint={translate('finance:export.formatHint')}
              {...register('format')}
            />
          </div>

          {errors.root?.serverError?.message ? (
            <p className="lm-export-form__error" role="alert">
              {errors.root.serverError.message}
            </p>
          ) : null}
        </div>

        <div className="lm-dialog__footer">
          <Button variant="secondary" onClick={onClose}>
            {translate('finance:actions.cancel')}
          </Button>
          <Button type="submit" variant="primary" icon="download" loading={isSubmitting}>
            {translate(isSubmitting ? 'finance:export.preparing' : 'finance:export.submit')}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

export default ExportTransactionsDialog
