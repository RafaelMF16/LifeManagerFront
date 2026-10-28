import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Dialog from '../../../shared/components/Dialog/Dialog'
import Icon from '../../../shared/components/Icon/Icon'
import type { NewAchievementDto } from '../../types/AchievementDtos'
import { achievementBonus, achievementName, achievementTierName, achievementTitle } from '../../utils/achievements'
import type { GameMoment } from '../../utils/gameMoments'
import './GameMomentDialog.css'

interface GameMomentDialogProps {
  moment: GameMoment
  /** Marks the moment as seen. */
  onClose: () => void
  /** Marks it as seen and opens the achievements page; offered on the achievements moment. */
  onSeeAchievements?: () => void
}

/**
 * Stops the player for what a toast would bury: a knockout (often caused by the day close while they were away), said
 * plainly with a way forward; new achievements, with their bonus and title (one moment for many, as on a first visit);
 * or a new level, celebrated.
 */
function GameMomentDialog({ moment, onClose, onSeeAchievements }: GameMomentDialogProps) {
  const { t: translate } = useTranslation('habits')
  const titleId = useId()

  return (
    <Dialog role="alertdialog" labelledBy={titleId} onClose={onClose}>
      <div className="lm-dialog__body">{renderBody()}</div>

      <div className="lm-dialog__footer">
        {moment.kind === 'achievements' && onSeeAchievements ? (
          <Button variant="secondary" onClick={onSeeAchievements}>
            {translate('habits:moments.achievements.see')}
          </Button>
        ) : null}
        <Button variant="primary" onClick={onClose} autoFocus>
          {translate(`habits:moments.${moment.kind}.confirm`)}
        </Button>
      </div>
    </Dialog>
  )

  function renderBody() {
    if (moment.kind === 'knockout') {
      return (
        <div className="lm-game-moment lm-game-moment--knockout">
          <span className="lm-game-moment__icon" aria-hidden="true">
            <Icon name="heart" size={32} />
          </span>
          <h2 id={titleId} className="lm-game-moment__title">
            {translate('habits:moments.knockout.title')}
          </h2>
          <p className="lm-game-moment__loss">{translate('habits:moments.knockout.loss', { count: moment.knockout.coinsLost })}</p>
          <p className="lm-game-moment__message">{translate('habits:moments.knockout.message')}</p>
        </div>
      )
    }

    if (moment.kind === 'achievements') return renderAchievements(moment.achievements)

    return (
      <div className="lm-game-moment lm-game-moment--level-up">
        <span className="lm-game-moment__icon" aria-hidden="true">
          <Icon name="sparkles" size={32} />
        </span>
        <h2 id={titleId} className="lm-game-moment__title">
          {translate('habits:moments.levelUp.title', { level: moment.level })}
        </h2>
        <p className="lm-game-moment__message">{translate('habits:moments.levelUp.message')}</p>
      </div>
    )
  }

  function renderAchievements(achievements: NewAchievementDto[]) {
    const [first] = achievements
    const single = achievements.length === 1
    const total = {
      coinsBonus: achievements.reduce((sum, achievement) => sum + achievement.coinsBonus, 0),
      xpBonus: achievements.reduce((sum, achievement) => sum + achievement.xpBonus, 0),
    }

    return (
      <div className={`lm-game-moment lm-game-moment--achievement lm-game-moment--${first.tier.toLowerCase()}`}>
        <span className="lm-game-moment__icon" aria-hidden="true">
          <Icon name="trophy" size={32} />
        </span>
        <h2 id={titleId} className="lm-game-moment__title">
          {single
            ? translate('habits:moments.achievements.titleOne')
            : translate('habits:moments.achievements.titleMany', { count: achievements.length })}
        </h2>
        {single ? (
          <>
            <p className="lm-game-moment__name">
              {achievementName(first.code, translate)} · {achievementTierName(first.tier, translate)}
            </p>
            <p className="lm-game-moment__loss">{achievementBonus(first, translate)}</p>
            <p className="lm-game-moment__message">
              {translate('habits:moments.achievements.titleUnlocked', { title: achievementTitle(first.code, translate) })}
            </p>
          </>
        ) : (
          <>
            <ul className="lm-game-moment__list">
              {achievements.map((achievement) => (
                <li key={achievement.code} className={`lm-game-moment__item lm-game-moment__item--${achievement.tier.toLowerCase()}`}>
                  <Icon name="medal" size={16} aria-hidden="true" />
                  <span>{achievementName(achievement.code, translate)}</span>
                  <span className="lm-game-moment__item-tier">{achievementTierName(achievement.tier, translate)}</span>
                </li>
              ))}
            </ul>
            <p className="lm-game-moment__loss">{achievementBonus(total, translate)}</p>
            <p className="lm-game-moment__message">{translate('habits:moments.achievements.titlesUnlocked')}</p>
          </>
        )}
      </div>
    )
  }
}

export default GameMomentDialog
