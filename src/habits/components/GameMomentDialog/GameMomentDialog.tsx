import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Dialog from '../../../shared/components/Dialog/Dialog'
import Icon from '../../../shared/components/Icon/Icon'
import type { GameMoment } from '../../utils/gameMoments'
import './GameMomentDialog.css'

interface GameMomentDialogProps {
  moment: GameMoment
  /** Marks the moment as seen. */
  onClose: () => void
}

/**
 * Stops the player for what a toast would bury: a knockout (often caused by the day close while they were away), said
 * plainly with a way forward, or a new level, celebrated.
 */
function GameMomentDialog({ moment, onClose }: GameMomentDialogProps) {
  const { t: translate } = useTranslation('habits')
  const titleId = useId()
  const knockout = moment.kind === 'knockout'

  return (
    <Dialog role="alertdialog" labelledBy={titleId} onClose={onClose}>
      <div className="lm-dialog__body">
        <div className={`lm-game-moment lm-game-moment--${knockout ? 'knockout' : 'level-up'}`}>
          <span className="lm-game-moment__icon" aria-hidden="true">
            <Icon name={knockout ? 'heart' : 'sparkles'} size={32} />
          </span>
          <h2 id={titleId} className="lm-game-moment__title">
            {knockout
              ? translate('habits:moments.knockout.title')
              : translate('habits:moments.levelUp.title', { level: moment.level })}
          </h2>
          {knockout ? (
            <>
              <p className="lm-game-moment__loss">
                {translate('habits:moments.knockout.loss', { count: moment.knockout.coinsLost })}
              </p>
              <p className="lm-game-moment__message">{translate('habits:moments.knockout.message')}</p>
            </>
          ) : (
            <p className="lm-game-moment__message">{translate('habits:moments.levelUp.message')}</p>
          )}
        </div>
      </div>

      <div className="lm-dialog__footer">
        <Button variant="primary" onClick={onClose} autoFocus>
          {translate(knockout ? 'habits:moments.knockout.confirm' : 'habits:moments.levelUp.confirm')}
        </Button>
      </div>
    </Dialog>
  )
}

export default GameMomentDialog
