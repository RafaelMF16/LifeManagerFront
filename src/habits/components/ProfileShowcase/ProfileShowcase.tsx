import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import type { AchievementsStatus } from '../../hooks/useAchievements'
import type { AchievementsResponseDto } from '../../types/AchievementDtos'
import { nearestAchievements } from '../../utils/achievements'
import { showcase } from '../../utils/playerProfile'
import AchievementCard from '../AchievementGrid/AchievementCard'
import '../AchievementGrid/AchievementGrid.css'
import './ProfileShowcase.css'

interface ProfileShowcaseProps {
  achievements: AchievementsResponseDto | undefined
  status: AchievementsStatus
  onRetry: () => void
}

/** The profile's best achievements (gold first) and the next goal; before any unlock, just the next goal. */
function ProfileShowcase({ achievements, status, onRetry }: ProfileShowcaseProps) {
  const { t: translate } = useTranslation('habits')

  if (!achievements) {
    return (
      <div className="lm-achievement-grid">
        <div className="lm-achievement-grid__state">
          {status === 'error' ? (
            <>
              {translate('habits:achievements.loadError')}
              <Button variant="secondary" size="sm" onClick={onRetry}>
                {translate('habits:profile.retry')}
              </Button>
            </>
          ) : (
            translate('habits:achievements.loading')
          )}
        </div>
      </div>
    )
  }

  const best = showcase(achievements.achievements)
  const [nextGoal] = nearestAchievements(achievements.achievements, 1)

  return (
    <div className="lm-achievement-grid lm-profile-showcase">
      <div className="lm-achievement-grid__heading">
        <p className="lm-achievement-grid__hint">
          {translate('habits:achievements.summary', { unlocked: achievements.unlockedCount, total: achievements.total })}
        </p>
      </div>
      <div className="lm-achievement-grid__body">
        {best.length > 0 ? (
          <ul className="lm-achievement-grid__cards" aria-label={translate('habits:profile.showcase.bestAria')}>
            {best.map((achievement) => (
              <AchievementCard key={achievement.code} achievement={achievement} />
            ))}
          </ul>
        ) : (
          <p className="lm-profile-showcase__empty">{translate('habits:profile.showcase.empty')}</p>
        )}

        {nextGoal ? (
          <section className="lm-achievement-grid__family" aria-labelledby="lm-profile-next-goal">
            <h3 id="lm-profile-next-goal" className="lm-achievement-grid__family-title">
              {translate('habits:profile.showcase.nextGoal')}
            </h3>
            <ul className="lm-achievement-grid__cards">
              <AchievementCard achievement={nextGoal} showRemaining />
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  )
}

export default ProfileShowcase
