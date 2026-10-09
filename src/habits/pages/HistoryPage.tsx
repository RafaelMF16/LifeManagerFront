import { useTranslation } from 'react-i18next'
import LedgerList from '../components/LedgerList/LedgerList'
import { useLedger } from '../hooks/useLedger'
import './HistoryPage.css'

const PAGE_SIZE = 20

/** The player's whole statement: every coin, XP and HP change, newest first. */
function HistoryPage() {
  const { t: translate } = useTranslation('habits')
  const ledger = useLedger(PAGE_SIZE)

  return (
    <main className="lm-history-page">
      <div className="lm-history-page__heading">
        <span className="lm-history-page__eyebrow">{translate('habits:module.name')}</span>
        <h1 className="lm-history-page__title">{translate('habits:history.title')}</h1>
        <p className="lm-history-page__intro">{translate('habits:history.intro')}</p>
      </div>

      <LedgerList
        data={ledger.data}
        status={ledger.status}
        isFetching={ledger.isFetching}
        onPageChange={ledger.setPage}
        onRetry={ledger.reload}
        title={translate('habits:history.listTitle')}
        hint={translate('habits:history.listHint')}
        emptyMessage={translate('habits:history.empty')}
      />
    </main>
  )
}

export default HistoryPage
