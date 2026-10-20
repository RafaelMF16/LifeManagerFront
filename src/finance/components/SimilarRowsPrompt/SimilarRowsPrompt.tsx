import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Icon from '../../../shared/components/Icon/Icon'
import './SimilarRowsPrompt.css'

interface SimilarRowsPromptProps {
  /** The row the user just filed. */
  description: string
  count: number
  busy: boolean
  onApply: () => void
  onDismiss: () => void
}

/** After filing a row, offers to file the other lines of the same merchant the same way. */
function SimilarRowsPrompt({ description, count, busy, onApply, onDismiss }: SimilarRowsPromptProps) {
  const { t: translate } = useTranslation('finance')

  return (
    <div className="lm-similar-prompt" role="status">
      <Icon name="sparkles" size={16} aria-hidden="true" className="lm-similar-prompt__icon" />
      <p className="lm-similar-prompt__message">{translate('finance:imports.similar.message', { count, description })}</p>
      <div className="lm-similar-prompt__actions">
        <Button variant="ghost" size="sm" disabled={busy} onClick={onDismiss}>
          {translate('finance:imports.similar.dismiss')}
        </Button>
        <Button variant="primary" size="sm" loading={busy} onClick={onApply}>
          {translate('finance:imports.similar.apply')}
        </Button>
      </div>
    </div>
  )
}

export default SimilarRowsPrompt
