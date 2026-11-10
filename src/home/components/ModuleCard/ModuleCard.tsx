import { useTranslation } from 'react-i18next'
import Icon from '../../../shared/components/Icon/Icon'
import type { HomeModule } from '../../types/HomeModule'
import './ModuleCard.css'

interface ModuleCardProps {
  module: HomeModule
  onClick?: () => void
  /** Icon and name only, on one line (the Home's shortcuts below the summary). */
  compact?: boolean
}

function ModuleCard({ module, onClick, compact = false }: ModuleCardProps) {
  const { t: translate } = useTranslation('home')
  const classes = `lm-module-card${compact ? ' lm-module-card--compact' : ''}${module.ready ? '' : ' lm-module-card--disabled'}`

  return (
    <button
      type="button"
      className={classes}
      disabled={!module.ready}
      onClick={(event) => {
        event.preventDefault()
        onClick?.()
      }}
    >
      <span className={`lm-module-card__icon${module.ready ? '' : ' lm-module-card__icon--disabled'}`}>
        <Icon name={module.icon} size={18} />
      </span>

      <span className="lm-module-card__name">
        {translate(`modules.${module.id}.name`)}
        {!module.ready ? <span className="lm-module-card__badge">{translate('moduleCard.comingSoon')}</span> : null}
      </span>

      {compact ? null : <span className="lm-module-card__description">{translate(`modules.${module.id}.description`)}</span>}
    </button>
  )
}

export default ModuleCard
