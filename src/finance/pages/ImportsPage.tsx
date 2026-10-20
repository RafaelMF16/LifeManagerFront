import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useErrorModal } from '../../shared/hooks/useErrorModal'
import { useToast } from '../../shared/hooks/useToast'
import { isSessionExpiredError } from '../../shared/services/httpClient'
import { isApiError } from '../../shared/types/ApiError'
import CsvMappingDialog from '../components/CsvMappingDialog/CsvMappingDialog'
import DeleteImportDialog from '../components/DeleteImportDialog/DeleteImportDialog'
import StatementImportList from '../components/StatementImportList/StatementImportList'
import StatementUpload from '../components/StatementUpload/StatementUpload'
import type { StatementUploadBusy } from '../components/StatementUpload/StatementUpload'
import { useStatementImports } from '../hooks/useStatementImports'
import { createStatementImport } from '../services/statementImportService'
import type { StatementImportResponseDto, StatementImportSource } from '../types/StatementImportDtos'
import { guessMapping, layoutSignature, loadRememberedMapping, rememberMapping } from '../utils/statementImport/csvMapping'
import type { CsvMapping } from '../utils/statementImport/csvMapping'
import { readStatementFile } from '../utils/statementImport/readStatementFile'
import { STATEMENT_MAX_LINES, isStatementFileError, keepImportableLines, todayIso } from '../utils/statementImport/statementLines'
import type { StatementLineInput } from '../utils/statementImport/statementLines'
import './ImportsPage.css'

interface CsvInProgress {
  fileName: string
  rows: string[][]
  initialMapping: CsvMapping
}

/** Where a bank statement comes in, and the list of imports (drafts being reviewed, then the history). */
function ImportsPage() {
  const { t: translate } = useTranslation(['finance', 'common'])
  const navigate = useNavigate()
  const { show: showToast } = useToast()
  const { show: showErrorModal } = useErrorModal()
  const imports = useStatementImports()
  const [busy, setBusy] = useState<StatementUploadBusy>(null)
  const [csv, setCsv] = useState<CsvInProgress | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<StatementImportResponseDto | null>(null)

  const showUploadError = (message: string) => showErrorModal(translate('finance:imports.upload.errors.title'), message)

  async function createDraft(fileName: string, source: StatementImportSource, accountKey: string | null, rawLines: StatementLineInput[]) {
    const { lines, skippedCount } = keepImportableLines(rawLines, todayIso())
    if (lines.length === 0) return showUploadError(translate('finance:imports.upload.errors.noLines'))
    if (lines.length > STATEMENT_MAX_LINES) {
      return showUploadError(translate('finance:imports.upload.errors.tooManyLines', { max: STATEMENT_MAX_LINES }))
    }

    setBusy('creating')
    try {
      const noDescription = translate('finance:imports.upload.noDescription')
      const draft = await createStatementImport({
        fileName,
        source,
        accountKey,
        lines: lines.map((line) => ({ ...line, description: line.description.trim() || noDescription })),
      })
      showToast(
        translate('finance:imports.toasts.created'),
        skippedCount > 0
          ? translate('finance:imports.upload.skipped', { count: skippedCount })
          : translate('finance:imports.toasts.createdDetail', { count: draft.rowCount }),
      )
      navigate(`/finance/imports/${draft.id}`)
    } catch (err) {
      if (isSessionExpiredError(err)) return
      showErrorModal(
        translate(isApiError(err) ? 'finance:imports.upload.errors.saveTitle' : 'common:errors.connection.title'),
        isApiError(err) ? translate('finance:imports.upload.errors.saveMessage') : translate('common:errors.connection.message'),
      )
    } finally {
      setBusy(null)
    }
  }

  async function handleFile(file: File) {
    setBusy('reading')
    try {
      const statement = await readStatementFile(file)
      if (statement.kind === 'ofx') {
        await createDraft(statement.fileName, 'Ofx', statement.accountKey, statement.lines)
        return
      }

      const guessed = guessMapping(statement.rows)
      const remembered = loadRememberedMapping(layoutSignature(statement.rows, guessed.hasHeader))
      setCsv({ fileName: statement.fileName, rows: statement.rows, initialMapping: remembered ?? guessed })
    } catch (err) {
      showUploadError(
        isStatementFileError(err) ? translate(`finance:imports.upload.errors.${err.reason}`) : translate('finance:imports.upload.errors.unreadable'),
      )
    } finally {
      setBusy((current) => (current === 'reading' ? null : current))
    }
  }

  function handleCsvSubmit(mapping: CsvMapping, lines: StatementLineInput[]) {
    if (!csv) return
    rememberMapping(layoutSignature(csv.rows, mapping.hasHeader), mapping)
    setCsv(null)
    void createDraft(csv.fileName, 'Csv', null, lines)
  }

  async function handleConfirmDelete(item: StatementImportResponseDto) {
    try {
      await imports.deleteImport(item.id)
      showToast(translate(item.status === 'Draft' ? 'finance:imports.toasts.discarded' : 'finance:imports.toasts.removed'))
    } catch (err) {
      if (isSessionExpiredError(err)) return
      showErrorModal(
        translate('finance:imports.delete.errorTitle'),
        translate(isApiError(err) ? 'common:errors.generic' : 'common:errors.connection.message'),
      )
      imports.reload()
    }
    setDeleteTarget(null)
  }

  return (
    <main className="lm-imports-page">
      <div className="lm-imports-page__header">
        <span className="lm-imports-page__eyebrow">{translate('finance:module.name')}</span>
        <h1 className="lm-imports-page__title">{translate('finance:imports.title')}</h1>
        <p className="lm-imports-page__intro">{translate('finance:imports.intro')}</p>
      </div>

      <StatementUpload busy={busy} onFile={(file) => void handleFile(file)} />

      <StatementImportList
        data={imports.data}
        status={imports.status}
        isFetching={imports.isFetching}
        onPageChange={imports.setPage}
        onRetry={imports.reload}
        onDelete={setDeleteTarget}
      />

      {csv ? (
        <CsvMappingDialog
          fileName={csv.fileName}
          rows={csv.rows}
          initialMapping={csv.initialMapping}
          onClose={() => setCsv(null)}
          onSubmit={handleCsvSubmit}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteImportDialog
          statementImport={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => handleConfirmDelete(deleteTarget)}
        />
      ) : null}
    </main>
  )
}

export default ImportsPage
