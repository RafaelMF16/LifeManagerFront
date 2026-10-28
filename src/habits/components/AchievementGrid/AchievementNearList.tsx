import { useTranslation } from 'react-i18next'
import type { AchievementDto } from '../../types/AchievementDtos'
import { nearestAchievements } from '../../utils/achievements'
import AchievementCard from './AchievementCard'
import './AchievementGrid.css'

interface AchievementNearListProps {
  achievements: AchievementDto[]
}

/** "Almost there": the next goals, with what each still needs. Hidden once every achievement is unlocked. */
function AchievementNearList({ achievements }: AchievementNearListProps) {
  const { t: translate } = useTranslation('habits')
  const nearest = nearestAchievements(achievements)
  if (nearest.length === 0) return null

  return (
    <section className="lm-achievement-grid lm-achievement-grid--near" data-tour="achievements.near">
      <div className="lm-achievement-grid__heading">
        <h2 className="lm-achievement-grid__title">{translate('habits:achievements.near.title')}</h2>
        <p className="lm-achievement-grid__hint">{translate('habits:achievements.near.hint')}</p>
      </div>
      <div className="lm-achievement-grid__body">
        <ul className="lm-achievement-grid__cards">
          {nearest.map((achievement) => (
            <AchievementCard key={achievement.code} achievement={achievement} showRemaining />
          ))}
        </ul>
      </div>
    </section>
  )
}

export default AchievementNearList
