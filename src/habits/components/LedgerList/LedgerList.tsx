import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Icon from '../../../shared/components/Icon/Icon'
import Pagination from '../../../shared/components/Pagination/Pagination'
import type { PagedResponse } from '../../../shared/types/Paging'
import type { LedgerStatus } from '../../hooks/useLedger'
import type { GameLedgerEntryDto } from '../../types/LedgerDtos'
import { ledgerDeltas, ledgerIcon, ledgerTitle, signedValue } from '../../utils/ledgerEntry'
import './LedgerList.css'

interface LedgerListProps {
  data: PagedResponse<GameLedgerEntryDto> | undefined
  status: LedgerStatus
  isFetching: boolean
  onPageChange: (page: number) => void
  onRetry: () => void
  title: string
  /** Shown under the title; omitted when the context already says it. */
  hint?: string
  emptyMessage: string
}

/** The player's statement: what changed coins, XP or HP, on which game day, by how much. Newest first. */
function LedgerList({ data, status, isFetching, onPageChange, onRetry, title, hint, emptyMessage }: LedgerListProps) {
  const { t: translate, i18n } = useTranslation('habits')
  const dayFormat = new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'short', timeZone: 'UTC' })

  function formatDay(date: string) {
    const [year, month, day] = date.split('-').map(Number)
    return dayFormat.format(new Date(Date.UTC(year, month - 1, day)))
  }

  function renderRows() {
    if (status === 'loading') {
      return <div className="lm-ledger-list__state">{translate('habits:history.loading')}</div>
    }

    if (status === 'error' || !data) {
      return (
        <div className="lm-ledger-list__state">
          <span>{translate('habits:history.loadError')}</span>
          <Button variant="secondary" size="sm" onClick={onRetry}>
            {translate('habits:history.retry')}
          </Button>
        </div>
      )
    }

    if (data.totalCount === 0) {
      return <div className="lm-ledger-list__state">{emptyMessage}</div>
    }

    return (
      <ul className="lm-ledger-list__rows">
        {data.items.map((entry) => (
          <li key={entry.id} className="lm-ledger-list__row">
            <span className={`lm-ledger-list__icon lm-ledger-list__icon--${entry.kind.toLowerCase()}`} aria-hidden="true">
              <Icon name={ledgerIcon(entry)} size={16} />
            </span>
            <div className="lm-ledger-list__main">
              <span className="lm-ledger-list__title">{ledgerTitle(entry, translate)}</span>
              <time className="lm-ledger-list__day" dateTime={entry.occurredOn}>
                {formatDay(entry.occurredOn)}
              </time>
            </div>
            <ul className="lm-ledger-list__deltas" aria-label={translate('habits:history.changes')}>
              {ledgerDeltas(entry).map((delta) => (
                <li
                  key={delta.kind}
                  className={`lm-ledger-list__delta lm-ledger-list__delta--${delta.value > 0 ? 'up' : 'down'}`}
                >
                  {translate(`habits:history.deltas.${delta.kind}`, { value: signedValue(delta.value), count: Math.abs(delta.value) })}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    )
  }

  function rangeLabel(page: PagedResponse<GameLedgerEntryDto>) {
    const from = (page.page - 1) * page.pageSize + 1
    return translate('habits:history.range', { from, to: from + page.items.length - 1, count: page.totalCount })
  }

  return (
    <section
      className={`lm-ledger-list${isFetching && status === 'ready' ? ' lm-ledger-list--fetching' : ''}`}
      aria-busy={isFetching}
    >
      <div className="lm-ledger-list__toolbar">
        <h2 className="lm-ledger-list__heading">{title}</h2>
        {hint ? <span className="lm-ledger-list__hint">{hint}</span> : null}
      </div>

      <div className="lm-ledger-list__body">{renderRows()}</div>

      {status === 'ready' && data && data.totalPages > 1 ? (
        <Pagination page={data.page} totalPages={data.totalPages} rangeLabel={rangeLabel(data)} onPageChange={onPageChange} />
      ) : null}
    </section>
  )
}

export default LedgerList
