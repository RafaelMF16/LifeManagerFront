import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../../shared/hooks/useToast'
import { createQuickTransaction } from '../../services/transactionService'
import type { QuickTransactionResponseDto } from '../../types/TransactionDtos'
import { quickTransactionToast } from '../../utils/quickTransactionToast'
import TransactionFormModal from '../TransactionFormModal/TransactionFormModal'

interface QuickTransactionModalProps {
  onClose: () => void
  /** Runs after the transaction is saved (the screen reloads what it shows), before the modal closes. */
  onSaved?: (transaction: QuickTransactionResponseDto) => void
}

/**
 * "New transaction" from anywhere in Finance: the transaction form in quick mode, saved with
 * `POST /api/Transactions`, then a toast naming its month (and whether it was created) with "View month".
 */
function QuickTransactionModal({ onClose, onSaved }: QuickTransactionModalProps) {
  const { t: translate, i18n } = useTranslation('finance')
  const { show: showToast } = useToast()
  const navigate = useNavigate()

  return (
    <TransactionFormModal
      mode="quick"
      onClose={onClose}
      onSubmit={async (values) => {
        const saved = await createQuickTransaction(values)
        const toast = quickTransactionToast(saved.date, saved.monthCreated, i18n.language)
        showToast(translate(toast.key, { period: toast.period }), undefined, {
          label: translate('finance:transactions.quick.viewMonth'),
          onClick: () => navigate(`/finance/months/${saved.monthlySummaryId}`),
        })
        onSaved?.(saved)
        onClose()
      }}
    />
  )
}

export default QuickTransactionModal
