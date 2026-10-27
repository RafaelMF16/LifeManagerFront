import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import Button from '../../../shared/components/Button/Button'
import Icon from '../../../shared/components/Icon/Icon'
import IconButton from '../../../shared/components/IconButton/IconButton'
import Pagination from '../../../shared/components/Pagination/Pagination'
import type { PagedResponse } from '../../../shared/types/Paging'
import { useFinanceFormat } from '../../hooks/useFinanceFormat'
import type { StatementImportsStatus } from '../../hooks/useStatementImports'
import type { StatementImportResponseDto } from '../../types/StatementImportDtos'
import './StatementImportList.css'

interface StatementImportListProps {
  data: PagedResponse<StatementImportResponseDto> | undefined
  status: StatementImportsStatus
  isFetching: boolean
  onPageChange: (page: number) => void
  onRetry: () => void
  onDelete: (statementImport: StatementImportResponseDto) => void
}

/** The user's imports: drafts to continue reviewing first, then what was already imported. */
function StatementImportList({ data, status, isFetching, onPageChange, onRetry, onDelete }: StatementImportListProps) {
  const { t: translate, i18n } = useTranslation('finance')
  const { rangeLabel } = useFinanceFormat()
  const navigate = useNavigate()
  const dateFormatter = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' })

  function renderItem(item: StatementImportResponseDto) {
    const draft = item.status === 'Draft'
    const period = rangeLabel(item.firstDate.slice(0, 7), item.lastDate.slice(0, 7))
    const created = dateFormatter.format(new Date(item.createdAt))

    return (
      <li key={item.id} className="lm-import-list__item">
        <div className="lm-import-list__main">
          <span className="lm-import-list__name">
            <Icon name={draft ? 'pencil' : 'check'} size={14} aria-hidden="true" className="lm-import-list__status-icon" />
            <span className="lm-import-list__file">{item.fileName}</span>
          </span>
          <span className="lm-import-list__meta">
            <span className={`lm-import-list__badge lm-import-list__badge--${draft ? 'draft' : 'committed'}`}>
              {translate(draft ? 'finance:imports.list.draft' : 'finance:imports.list.committed')}
            </span>
            <span>{period}</span>
            <span>
              {draft
                ? translate('finance:imports.list.lines', { count: item.rowCount })
                : translate('finance:imports.list.imported', { count: item.importedCount ?? 0 })}
            </span>
            <span>{translate('finance:imports.list.createdAt', { date: created })}</span>
          </span>
        </div>
        <div className="lm-import-list__actions">
          {draft ? (
            <Button variant="secondary" size="sm" onClick={() => navigate(`/finance/imports/${item.id}`)} className="lm-import-list__continue">
              {translate('finance:imports.list.continue')}
            </Button>
          ) : null}
          <IconButton
            icon={draft ? 'trash-2' : 'x'}
            size="sm"
            label={translate(draft ? 'finance:imports.list.discard' : 'finance:imports.list.remove', { fileName: item.fileName })}
            onClick={() => onDelete(item)}
          />
        </div>
      </li>
    )
  }

  function renderBody() {
    if (status === 'loading') return <div className="lm-import-list__state">{translate('finance:imports.list.loading')}</div>

    if (status === 'error' || !data) {
      return (
        <div className="lm-import-list__state">
          <span>{translate('finance:imports.list.loadError')}</span>
          <Button variant="secondary" size="sm" onClick={onRetry}>
            {translate('finance:imports.list.retry')}
          </Button>
        </div>
      )
    }

    if (data.totalCount === 0) {
      return (
        <div className="lm-import-list__state">
          <span className="lm-import-list__state-title">{translate('finance:imports.list.empty')}</span>
          <span>{translate('finance:imports.list.emptyHint')}</span>
        </div>
      )
    }

    return (
      <ul className="lm-import-list__items" data-tour="imports.list">
        {data.items.map(renderItem)}
      </ul>
    )
  }

  function paginationLabel(page: PagedResponse<StatementImportResponseDto>) {
    const from = (page.page - 1) * page.pageSize + 1
    return translate('finance:imports.pagination.range', { from, to: from + page.items.length - 1, count: page.totalCount })
  }

  return (
    <section className={`lm-import-list${isFetching && status === 'ready' ? ' lm-import-list--fetching' : ''}`} aria-busy={isFetching}>
      <div className="lm-import-list__header">
        <h2 className="lm-import-list__title">{translate('finance:imports.list.title')}</h2>
      </div>
      <div className="lm-import-list__body">{renderBody()}</div>
      {status === 'ready' && data && data.totalPages > 1 ? (
        <Pagination page={data.page} totalPages={data.totalPages} rangeLabel={paginationLabel(data)} onPageChange={onPageChange} />
      ) : null}
    </section>
  )
}

export default StatementImportList
