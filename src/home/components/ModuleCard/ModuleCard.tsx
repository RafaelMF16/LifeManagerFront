import Icon from '../../../shared/components/Icon/Icon'
import type { HomeModule } from '../../types/HomeModule'
import './ModuleCard.css'

interface ModuleCardProps {
  module: HomeModule
  onClick?: () => void
}

function ModuleCard({ module, onClick }: ModuleCardProps) {
  const classes = `lm-module-card${module.ready ? '' : ' lm-module-card--disabled'}`

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
        {module.name}
        {!module.ready ? <span className="lm-module-card__badge">Em breve</span> : null}
      </span>

      <span className="lm-module-card__description">{module.description}</span>
    </button>
  )
}

export default ModuleCard
