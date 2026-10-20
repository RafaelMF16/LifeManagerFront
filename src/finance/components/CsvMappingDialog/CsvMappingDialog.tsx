import { useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Dialog from '../../../shared/components/Dialog/Dialog'
import IconButton from '../../../shared/components/IconButton/IconButton'
import SegmentedControl from '../../../shared/components/SegmentedControl/SegmentedControl'
import Select from '../../../shared/components/Select/Select'
import { useFinanceFormat } from '../../hooks/useFinanceFormat'
import { applyMapping, isMappingComplete } from '../../utils/statementImport/csvMapping'
import type { CsvAmountMode, CsvDateFormat, CsvMapping } from '../../utils/statementImport/csvMapping'
import type { DecimalSeparator } from '../../utils/statementImport/statementAmount'
import type { StatementLineInput } from '../../utils/statementImport/statementLines'
import Amount from '../Amount/Amount'
import './CsvMappingDialog.css'

const PREVIEW_ROWS = 5
const DATE_FORMATS: CsvDateFormat[] = ['dmy', 'ymd', 'mdy']
const DECIMAL_SEPARATORS: { value: DecimalSeparator; key: string }[] = [
  { value: ',', key: 'comma' },
  { value: '.', key: 'dot' },
]

interface CsvMappingDialogProps {
  fileName: string
  rows: string[][]
  /** Guessed from the file, or remembered from the last file with the same header. */
  initialMapping: CsvMapping
  onClose: () => void
  onSubmit: (mapping: CsvMapping, lines: StatementLineInput[]) => void
}

/**
 * Lets the user say which CSV column is the date, the description and the amount, with a preview of the first
 * lines as they will be read. Banks' CSV layouts differ, so the guess is only a starting point.
 */
function CsvMappingDialog({ fileName, rows, initialMapping, onClose, onSubmit }: CsvMappingDialogProps) {
  const { t: translate } = useTranslation('finance')
  const { dayLabel } = useFinanceFormat()
  const titleId = useId()
  const [mapping, setMapping] = useState(initialMapping)

  const columnCount = Math.max(...rows.map((row) => row.length))
  const header = mapping.hasHeader ? rows[0] : null
  const complete = isMappingComplete(mapping)
  const result = useMemo(() => (complete ? applyMapping(rows, mapping) : null), [complete, rows, mapping])

  const columnOptions = [
    { value: '-1', label: translate('finance:imports.mapping.choose') },
    ...Array.from({ length: columnCount }, (_, index) => {
      const name = header?.[index]?.trim()
      const sample = rows[mapping.hasHeader ? 1 : 0]?.[index]?.trim()
      const label = translate('finance:imports.mapping.column', { number: index + 1 })
      const detail = name || sample
      return { value: String(index), label: detail ? `${label} · ${detail.slice(0, 30)}` : label }
    }),
  ]

  function update(changes: Partial<CsvMapping>) {
    setMapping((current) => ({ ...current, ...changes }))
  }

  function columnSelect(field: 'dateColumn' | 'descriptionColumn' | 'amountColumn' | 'debitColumn' | 'creditColumn', labelKey: string) {
    return (
      <Select
        size="sm"
        label={translate(labelKey)}
        options={columnOptions}
        value={String(mapping[field])}
        onChange={(event) => update({ [field]: Number(event.target.value) })}
      />
    )
  }

  const lines = result?.lines ?? []

  return (
    <Dialog labelledBy={titleId} onClose={onClose} className="lm-csv-mapping">
      <div className="lm-dialog__header">
        <div className="lm-csv-mapping__heading">
          <h2 id={titleId} className="lm-dialog__title">
            {translate('finance:imports.mapping.title')}
          </h2>
          <span className="lm-csv-mapping__file">{fileName}</span>
        </div>
        <IconButton icon="x" size="sm" label={translate('finance:actions.close')} onClick={onClose} />
      </div>

      <div className="lm-dialog__body">
        <p className="lm-dialog__message">{translate('finance:imports.mapping.intro')}</p>

        <label className="lm-csv-mapping__check">
          <input type="checkbox" checked={mapping.hasHeader} onChange={(event) => update({ hasHeader: event.target.checked })} />
          {translate('finance:imports.mapping.hasHeader')}
        </label>

        <div className="lm-csv-mapping__grid">
          {columnSelect('dateColumn', 'finance:imports.mapping.date')}
          {columnSelect('descriptionColumn', 'finance:imports.mapping.description')}
        </div>

        <div className="lm-csv-mapping__field">
          <span className="lm-csv-mapping__label" aria-hidden="true">
            {translate('finance:imports.mapping.amountMode')}
          </span>
          <SegmentedControl
            size="md"
            aria-label={translate('finance:imports.mapping.amountMode')}
            options={(['single', 'split'] as CsvAmountMode[]).map((option) => ({
              value: option,
              label: translate(`finance:imports.mapping.amountModes.${option}`),
            }))}
            value={mapping.amountMode}
            onChange={(amountMode) => update({ amountMode })}
            className="lm-csv-mapping__segmented"
          />
        </div>

        <div className="lm-csv-mapping__grid">
          {mapping.amountMode === 'single' ? (
            columnSelect('amountColumn', 'finance:imports.mapping.amount')
          ) : (
            <>
              {columnSelect('debitColumn', 'finance:imports.mapping.debit')}
              {columnSelect('creditColumn', 'finance:imports.mapping.credit')}
            </>
          )}
        </div>

        <div className="lm-csv-mapping__grid">
          <Select
            size="sm"
            label={translate('finance:imports.mapping.dateFormat')}
            options={DATE_FORMATS.map((format) => ({ value: format, label: translate(`finance:imports.mapping.dateFormats.${format}`) }))}
            value={mapping.dateFormat}
            onChange={(event) => update({ dateFormat: event.target.value as CsvDateFormat })}
          />
          <Select
            size="sm"
            label={translate('finance:imports.mapping.decimalSeparator')}
            options={DECIMAL_SEPARATORS.map((separator) => ({
              value: separator.value,
              label: translate(`finance:imports.mapping.decimalSeparators.${separator.key}`),
            }))}
            value={mapping.decimalSeparator}
            onChange={(event) => update({ decimalSeparator: event.target.value as DecimalSeparator })}
          />
        </div>

        <label className="lm-csv-mapping__check">
          <input type="checkbox" checked={mapping.invertSign} onChange={(event) => update({ invertSign: event.target.checked })} />
          <span>
            {translate('finance:imports.mapping.invertSign')}
            <span className="lm-csv-mapping__check-hint">{translate('finance:imports.mapping.invertSignHint')}</span>
          </span>
        </label>

        <div className="lm-csv-mapping__preview">
          <span className="lm-csv-mapping__label">{translate('finance:imports.mapping.preview')}</span>
          {lines.length === 0 ? (
            <p className="lm-csv-mapping__empty">{translate('finance:imports.mapping.previewEmpty')}</p>
          ) : (
            <ul className="lm-csv-mapping__lines">
              {lines.slice(0, PREVIEW_ROWS).map((line, index) => (
                <li key={index} className="lm-csv-mapping__line">
                  <span className="lm-csv-mapping__line-date lm-numeric">
                    {dayLabel(line.date)} {line.date.slice(0, 4)}
                  </span>
                  <span className="lm-csv-mapping__line-description">{line.description || '—'}</span>
                  <Amount value={line.amount} tone="signed" />
                </li>
              ))}
            </ul>
          )}
          {result ? (
            <p className="lm-csv-mapping__counts">
              {translate('finance:imports.mapping.readable', { count: result.lines.length })}
              {result.unreadableCount > 0 ? ` · ${translate('finance:imports.mapping.unreadable', { count: result.unreadableCount })}` : ''}
            </p>
          ) : null}
        </div>
      </div>

      <div className="lm-dialog__footer">
        <Button variant="secondary" onClick={onClose}>
          {translate('finance:actions.cancel')}
        </Button>
        <Button variant="primary" disabled={lines.length === 0} onClick={() => onSubmit(mapping, lines)}>
          {translate('finance:imports.mapping.submit')}
        </Button>
      </div>
    </Dialog>
  )
}

export default CsvMappingDialog
