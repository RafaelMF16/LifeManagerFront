import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import './UnsavedChangesBar.css'

interface UnsavedChangesBarProps {
  /** Why saving isn't possible yet; null when it is. */
  blockedReason: string | null
  isSaving: boolean
  onDiscard: () => void
  onSave: () => void
}

/**
 * Sticks to the bottom of the page while the budget has changes that aren't saved. It sits in the page's flow
 * (sticky, not fixed), so it never covers the sidebar or the last slice.
 */
function UnsavedChangesBar({ blockedReason, isSaving, onDiscard, onSave }: UnsavedChangesBarProps) {
  const { t: translate } = useTranslation('finance')

  return (
    <div
      className="lm-unsaved-bar"
      role="region"
      aria-label={translate('finance:budgetPlan.unsaved.label')}
      data-tour="budget.save"
    >
      <div className="lm-unsaved-bar__text">
        <span className="lm-unsaved-bar__label">
          <span className="lm-unsaved-bar__dot" aria-hidden="true" />
          {translate('finance:budgetPlan.unsaved.label')}
        </span>
        {blockedReason ? <span className="lm-unsaved-bar__hint">{blockedReason}</span> : null}
      </div>
      <div className="lm-unsaved-bar__actions">
        <Button variant="ghost" onClick={onDiscard} disabled={isSaving}>
          {translate('finance:budgetPlan.unsaved.discard')}
        </Button>
        <Button variant="primary" onClick={onSave} disabled={blockedReason !== null || isSaving}>
          {translate('finance:budgetPlan.unsaved.save')}
        </Button>
      </div>
    </div>
  )
}

export default UnsavedChangesBar
