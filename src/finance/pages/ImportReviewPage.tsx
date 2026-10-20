import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../../shared/components/Button/Button'
import Icon from '../../shared/components/Icon/Icon'
import { useErrorModal } from '../../shared/hooks/useErrorModal'
import { useToast } from '../../shared/hooks/useToast'
import { isSessionExpiredError } from '../../shared/services/httpClient'
import { isApiError } from '../../shared/types/ApiError'
import CategoryFormModal from '../components/CategoryFormModal/CategoryFormModal'
import CommitImportDialog from '../components/CommitImportDialog/CommitImportDialog'
import DeleteImportDialog from '../components/DeleteImportDialog/DeleteImportDialog'
import ImportBulkBar from '../components/ImportBulkBar/ImportBulkBar'
import ImportMonthsOverview from '../components/ImportMonthsOverview/ImportMonthsOverview'
import ImportRowFormModal from '../components/ImportRowFormModal/ImportRowFormModal'
import ImportRowList, { NEW_CATEGORY_OPTION } from '../components/ImportRowList/ImportRowList'
import SimilarRowsPrompt from '../components/SimilarRowsPrompt/SimilarRowsPrompt'
import { useCategoryOptions } from '../hooks/useCategoryOptions'
import { useFinanceFormat } from '../hooks/useFinanceFormat'
import { useImportRows } from '../hooks/useImportRows'
import { useStatementImport } from '../hooks/useStatementImport'
import { createCategory } from '../services/categoryService'
import { commitStatementImport, deleteStatementImport } from '../services/statementImportService'
import type { StatementImportBulkUpdateDto, StatementImportRowDto, StatementImportRowFilter, StatementImportRowRequestDto } from '../types/StatementImportDtos'
import { parseAmount } from '../validation/amountSchema'
import type { CategoryFormValues } from '../validation/categorySchema'
import type { ImportRowFormValues } from '../validation/importRowSchema'
import {
  STATEMENT_IMPORT_GONE_CODES,
  STATEMENT_IMPORT_ROW_NOT_FOUND_CODE,
  STATEMENT_IMPORT_UNCATEGORIZED_ROWS_CODE,
} from '../validation/statementImportErrorMap'
import './ImportReviewPage.css'

const NO_SELECTION: ReadonlySet<number> = new Set()

function toRequest(row: StatementImportRowDto): StatementImportRowRequestDto {
  return {
    type: row.type,
    categoryId: row.categoryId,
    amount: row.amount,
    description: row.description,
    date: row.date,
    included: row.included,
    shiftToNextMonth: row.shiftToNextMonth,
  }
}

interface SimilarOffer {
  rowId: number
  description: string
  count: number
}

/**
 * The review of a draft import: its months, its lines (filed by suggestion, with possible duplicates left out),
 * every change saved on the spot, then the confirmation that posts it all.
 */
function ImportReviewPage() {
  const { t: translate } = useTranslation(['finance', 'common'])
  const navigate = useNavigate()
  const { importId: idParam } = useParams()
  const importId = Number(idParam)
  const { show: showToast } = useToast()
  const { show: showErrorModal } = useErrorModal()
  const { rangeLabel } = useFinanceFormat()
  const details = useStatementImport(importId)
  const reloadDetails = details.reload
  const rows = useImportRows(importId, reloadDetails)
  const categoryOptions = useCategoryOptions()
  const [selection, setSelection] = useState<{ ids: ReadonlySet<number>; pageKey: string }>({ ids: NO_SELECTION, pageKey: '' })
  const [pendingIds, setPendingIds] = useState<ReadonlySet<number>>(NO_SELECTION)
  const [bulkBusy, setBulkBusy] = useState(false)
  const [editTarget, setEditTarget] = useState<StatementImportRowDto | null>(null)
  const [categoryTarget, setCategoryTarget] = useState<StatementImportRowDto | null>(null)
  const [similar, setSimilar] = useState<SimilarOffer | null>(null)
  const [similarBusy, setSimilarBusy] = useState(false)
  const [isCommitOpen, setIsCommitOpen] = useState(false)
  const [isDiscardOpen, setIsDiscardOpen] = useState(false)

  // A selection belongs to the page it was made on: another page, filter or sort starts with nothing selected.
  const selectedIds = selection.pageKey === rows.pageKey ? selection.ids : NO_SELECTION

  const setPending = useCallback((rowId: number, pending: boolean) => {
    setPendingIds((current) => {
      const next = new Set(current)
      if (pending) next.add(rowId)
      else next.delete(rowId)
      return next
    })
  }, [])

  /** Errors of row changes: a vanished draft or row reloads, anything else is explained in the error modal. */
  function showChangeError(err: unknown) {
    if (isSessionExpiredError(err)) return
    if (!isApiError(err)) {
      showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
    } else if (STATEMENT_IMPORT_GONE_CODES.includes(err.code)) {
      showErrorModal(translate('finance:imports.errors.actionTitle'), translate('finance:imports.errors.gone'))
      reloadDetails()
    } else if (err.code === STATEMENT_IMPORT_ROW_NOT_FOUND_CODE) {
      showErrorModal(translate('finance:imports.errors.actionTitle'), translate('finance:imports.errors.rowGone'))
      rows.reloadAll()
    } else if (err.code === 'Category.NotFound') {
      showErrorModal(translate('finance:imports.errors.actionTitle'), translate('finance:transactions.validation.category.notFound'))
      categoryOptions.reload()
    } else {
      showErrorModal(translate('finance:imports.errors.actionTitle'), translate('common:errors.generic'))
    }
  }

  /** Saves a row and, when other rows of the same merchant are filed differently, offers to file them alike. */
  async function saveRow(row: StatementImportRowDto, request: StatementImportRowRequestDto) {
    const result = await rows.updateRow(row.id, request)
    setSimilar(result.similarCount > 0 ? { rowId: row.id, description: result.row.description, count: result.similarCount } : null)
  }

  async function saveRowFromList(row: StatementImportRowDto, request: StatementImportRowRequestDto) {
    setPending(row.id, true)
    try {
      await saveRow(row, request)
    } catch (err) {
      showChangeError(err)
    } finally {
      setPending(row.id, false)
    }
  }

  function handleCategoryChange(row: StatementImportRowDto, value: string) {
    if (value === NEW_CATEGORY_OPTION) {
      setCategoryTarget(row)
      return
    }
    void saveRowFromList(row, { ...toRequest(row), categoryId: value === '' ? null : Number(value) })
  }

  async function handleEditSubmit(values: ImportRowFormValues) {
    if (!editTarget) return
    await saveRow(editTarget, {
      type: values.type,
      categoryId: values.categoryId === '' ? null : Number(values.categoryId),
      // The schema already rejected anything parseAmount can't read.
      amount: parseAmount(values.amount) ?? 0,
      description: values.description,
      date: values.date,
      included: values.included,
      shiftToNextMonth: values.shiftToNextMonth,
    })
    showToast(translate('finance:imports.toasts.rowSaved'))
    setEditTarget(null)
  }

  async function handleCreateCategory(values: CategoryFormValues) {
    if (!categoryTarget) return
    const created = await createCategory(values)
    categoryOptions.reload()
    showToast(translate('finance:imports.toasts.categoryCreated'))
    const row = categoryTarget
    setCategoryTarget(null)
    await saveRowFromList(row, { ...toRequest(row), categoryId: created.id })
  }

  async function handleApplySimilar() {
    if (!similar) return
    setSimilarBusy(true)
    try {
      const changed = await rows.applyToSimilar(similar.rowId)
      showToast(translate('finance:imports.similar.applied', { count: changed.updatedCount }))
      setSimilar(null)
    } catch (err) {
      showChangeError(err)
    } finally {
      setSimilarBusy(false)
    }
  }

  async function handleBulk(change: Omit<StatementImportBulkUpdateDto, 'rowIds'>) {
    setBulkBusy(true)
    try {
      const changed = await rows.bulkUpdate({ rowIds: [...selectedIds], ...change })
      showToast(translate('finance:imports.bulk.applied', { count: changed.updatedCount }))
      setSelection({ ids: NO_SELECTION, pageKey: '' })
      setSimilar(null)
    } catch (err) {
      showChangeError(err)
    } finally {
      setBulkBusy(false)
    }
  }

  function toggleSelected(rowId: number) {
    const next = new Set(selectedIds)
    if (next.has(rowId)) next.delete(rowId)
    else next.add(rowId)
    setSelection({ ids: next, pageKey: rows.pageKey })
  }

  function toggleSelectPage(rowIds: number[]) {
    const allSelected = rowIds.every((id) => selectedIds.has(id))
    setSelection({ ids: allSelected ? NO_SELECTION : new Set(rowIds), pageKey: rows.pageKey })
  }

  function showFilter(filter: StatementImportRowFilter) {
    rows.setMonth(null)
    rows.setFilter(filter)
  }

  async function handleCommit() {
    try {
      const result = await commitStatementImport(importId)
      showToast(
        translate('finance:imports.toasts.committed'),
        result.skippedCount > 0
          ? translate('finance:imports.toasts.committedWithSkipped', { count: result.importedCount, skipped: result.skippedCount })
          : translate('finance:imports.toasts.committedDetail', { count: result.importedCount }),
      )
      navigate('/finance/months')
    } catch (err) {
      setIsCommitOpen(false)
      if (isSessionExpiredError(err)) return
      if (isApiError(err) && err.code === STATEMENT_IMPORT_UNCATEGORIZED_ROWS_CODE) {
        showErrorModal(translate('finance:imports.commit.errorTitle'), translate('finance:imports.commit.uncategorized'))
        rows.reloadAll()
      } else {
        showChangeError(err)
      }
    }
  }

  async function handleDiscard() {
    try {
      await deleteStatementImport(importId)
      showToast(translate('finance:imports.toasts.discarded'))
      navigate('/finance/imports')
    } catch (err) {
      setIsDiscardOpen(false)
      showChangeError(err)
    }
  }

  const backLink = (
    <Link to="/finance/imports" className="lm-import-review__back">
      <Icon name="chevron-left" size={12} aria-hidden="true" />
      {translate('finance:imports.review.back')}
    </Link>
  )

  if (details.status === 'notFound' || !Number.isInteger(importId)) {
    return (
      <main className="lm-import-review">
        {backLink}
        <div className="lm-import-review__state">
          <span>{translate('finance:imports.review.notFound')}</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/finance/imports')}>
            {translate('finance:imports.review.backToImports')}
          </Button>
        </div>
      </main>
    )
  }

  const data = details.data

  if (!data) {
    return (
      <main className="lm-import-review">
        {backLink}
        <div className="lm-import-review__state">
          {details.status === 'error' ? (
            <>
              <span>{translate('finance:imports.review.loadError')}</span>
              <Button variant="secondary" size="sm" onClick={details.reload}>
                {translate('finance:imports.review.retry')}
              </Button>
            </>
          ) : (
            <span>{translate('finance:imports.review.loading')}</span>
          )}
        </div>
      </main>
    )
  }

  const period = `${rangeLabel(data.firstDate.slice(0, 7), data.lastDate.slice(0, 7))} · ${translate('finance:imports.review.lines', { count: data.rowCount })}`

  if (data.status === 'Committed') {
    return (
      <main className="lm-import-review">
        <div className="lm-import-review__heading">
          {backLink}
          <h1 className="lm-import-review__title">{data.fileName}</h1>
          <span className="lm-import-review__period">{period}</span>
        </div>
        <div className="lm-import-review__state">
          <span className="lm-import-review__state-title">{translate('finance:imports.review.committed')}</span>
          <span>{translate('finance:imports.review.committedDetail', { count: data.importedCount ?? 0 })}</span>
          <Button variant="primary" size="sm" onClick={() => navigate('/finance/months')}>
            {translate('finance:imports.review.goToMonths')}
          </Button>
        </div>
      </main>
    )
  }

  const canCommit = data.includedCount > 0 && data.uncategorizedCount === 0
  const summary: { filter: StatementImportRowFilter; key: string; count: number; tone?: string }[] = [
    { filter: 'All', key: 'included', count: data.includedCount },
    { filter: 'Uncategorized', key: 'uncategorized', count: data.uncategorizedCount, tone: data.uncategorizedCount > 0 ? 'warning' : undefined },
    { filter: 'Suggested', key: 'suggested', count: data.suggestedCount },
    { filter: 'Duplicates', key: 'duplicates', count: data.duplicateCount },
  ]

  return (
    <main className="lm-import-review">
      <div className="lm-import-review__header">
        <div className="lm-import-review__heading">
          {backLink}
          <h1 className="lm-import-review__title">{data.fileName}</h1>
          <span className="lm-import-review__period">{period}</span>
        </div>
        <div className="lm-import-review__actions">
          <Button variant="secondary" icon="trash-2" onClick={() => setIsDiscardOpen(true)}>
            {translate('finance:imports.review.discard')}
          </Button>
          <Button variant="primary" icon="check" disabled={!canCommit} onClick={() => setIsCommitOpen(true)} className="lm-import-review__confirm">
            {translate('finance:imports.review.confirm')}
          </Button>
        </div>
      </div>

      <div className={`lm-import-review__summary${details.isFetching ? ' lm-import-review__summary--fetching' : ''}`}>
        {summary.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`lm-import-review__chip${item.tone ? ` lm-import-review__chip--${item.tone}` : ''}`}
            aria-pressed={rows.filter === item.filter && rows.month === null}
            onClick={() => showFilter(item.filter)}
          >
            {translate(`finance:imports.review.summary.${item.key}`, { count: item.count })}
          </button>
        ))}
      </div>

      {data.uncategorizedCount > 0 ? (
        <p className="lm-import-review__hint" role="note">
          <Icon name="tags" size={14} aria-hidden="true" />
          {translate('finance:imports.review.pendingHint', { count: data.uncategorizedCount })}
        </p>
      ) : null}

      <ImportMonthsOverview months={data.months} selectedMonth={rows.month} onSelect={rows.setMonth} />

      {similar ? (
        <SimilarRowsPrompt
          description={similar.description}
          count={similar.count}
          busy={similarBusy}
          onApply={() => void handleApplySimilar()}
          onDismiss={() => setSimilar(null)}
        />
      ) : null}

      <ImportRowList
        data={rows.data}
        status={rows.status}
        isFetching={rows.isFetching}
        filter={rows.filter}
        onFilterChange={rows.setFilter}
        searchInput={rows.searchInput}
        onSearchChange={rows.setSearchInput}
        hasFilters={rows.hasFilters}
        onClearFilters={rows.clearFilters}
        sortBy={rows.sortBy}
        sortDirection={rows.sortDirection}
        onSortByChange={rows.changeSortBy}
        onToggleSortDirection={rows.toggleSortDirection}
        onPageChange={rows.setPage}
        onRetry={rows.reload}
        categories={categoryOptions.categories}
        categoriesStatus={categoryOptions.status}
        selectedIds={selectedIds}
        onToggleSelected={toggleSelected}
        onToggleSelectPage={toggleSelectPage}
        pendingIds={pendingIds}
        onCategoryChange={handleCategoryChange}
        onToggleIncluded={(row) => void saveRowFromList(row, { ...toRequest(row), included: !row.included })}
        onEdit={setEditTarget}
        bulkBar={
          selectedIds.size > 0 ? (
            <ImportBulkBar
              count={selectedIds.size}
              categories={categoryOptions.categories}
              busy={bulkBusy}
              onSetCategory={(categoryId) => void handleBulk({ categoryId, type: null, included: null })}
              onSetType={(type) => void handleBulk({ type, categoryId: null, included: null })}
              onSetIncluded={(included) => void handleBulk({ included, type: null, categoryId: null })}
              onClear={() => setSelection({ ids: NO_SELECTION, pageKey: '' })}
            />
          ) : null
        }
      />

      {editTarget ? (
        <ImportRowFormModal
          row={editTarget}
          categories={categoryOptions.categories}
          onClose={() => setEditTarget(null)}
          onSubmit={handleEditSubmit}
        />
      ) : null}

      {categoryTarget ? <CategoryFormModal onClose={() => setCategoryTarget(null)} onSubmit={handleCreateCategory} /> : null}

      {isCommitOpen ? <CommitImportDialog statementImport={data} onClose={() => setIsCommitOpen(false)} onConfirm={handleCommit} /> : null}

      {isDiscardOpen ? (
        <DeleteImportDialog statementImport={data} onClose={() => setIsDiscardOpen(false)} onConfirm={handleDiscard} />
      ) : null}
    </main>
  )
}

export default ImportReviewPage
