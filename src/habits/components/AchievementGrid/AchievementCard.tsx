import { useTranslation } from 'react-i18next'
import Icon from '../../../shared/components/Icon/Icon'
import type { AchievementDto } from '../../types/AchievementDtos'
import {
  achievementBonus,
  achievementCriterion,
  achievementFamilyIcon,
  achievementName,
  achievementPercent,
  achievementProgressLabel,
  achievementRemaining,
  achievementTierName,
  achievementTitle,
  formatUnlockedAt,
  isUnlocked,
} from '../../utils/achievements'

interface AchievementCardProps {
  achievement: AchievementDto
  /** "Almost there" shows what is missing instead of the bonus line. */
  showRemaining?: boolean
}

/** One achievement: its medal, name and criterion, then the progress bar (locked) or the unlock day, the bonus and the title. */
function AchievementCard({ achievement, showRemaining = false }: AchievementCardProps) {
  const { t: translate, i18n } = useTranslation('habits')
  const unlocked = isUnlocked(achievement)
  const tierClass = `lm-achievement-card--${achievement.tier.toLowerCase()}`

  return (
    <li className={`lm-achievement-card ${tierClass}${unlocked ? ' lm-achievement-card--unlocked' : ''}`}>
      <div className="lm-achievement-card__top">
        <span className="lm-achievement-card__medal" aria-hidden="true">
          <Icon name={unlocked ? achievementFamilyIcon(achievement.family) : 'lock'} size={20} />
        </span>
        <div className="lm-achievement-card__info">
          <span className="lm-achievement-card__tier">{achievementTierName(achievement.tier, translate)}</span>
          <span className="lm-achievement-card__name">{achievementName(achievement.code, translate)}</span>
          <span className="lm-achievement-card__criterion">{achievementCriterion(achievement, translate)}</span>
        </div>
      </div>

      {unlocked ? (
        <span className="lm-achievement-card__status">
          {translate('habits:achievements.unlockedOn', { date: formatUnlockedAt(achievement.unlockedAt!, i18n.language) })}
        </span>
      ) : (
        <div className="lm-achievement-card__progress">
          <div
            className="lm-achievement-card__bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={achievement.threshold}
            aria-valuenow={achievement.progress}
            aria-label={translate('habits:achievements.progressAria', { progress: achievement.progress, threshold: achievement.threshold })}
          >
            <span className="lm-achievement-card__fill" style={{ width: `${achievementPercent(achievement)}%` }} />
          </div>
          <span className="lm-achievement-card__count">
            {showRemaining ? achievementRemaining(achievement, translate) : achievementProgressLabel(achievement)}
          </span>
        </div>
      )}

      <div className="lm-achievement-card__meta">
        <span className="lm-achievement-card__bonus">
          <Icon name="coins" size={14} aria-hidden="true" />
          {achievementBonus(achievement, translate)}
        </span>
        <span className="lm-achievement-card__title">
          {translate('habits:achievements.unlocksTitle', { title: achievementTitle(achievement.code, translate) })}
        </span>
      </div>
    </li>
  )
}

export default AchievementCard
