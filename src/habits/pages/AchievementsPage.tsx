import { useTranslation } from 'react-i18next'
import Icon from '../../shared/components/Icon/Icon'
import AchievementGrid from '../components/AchievementGrid/AchievementGrid'
import AchievementNearList from '../components/AchievementGrid/AchievementNearList'
import { useAchievements } from '../hooks/useAchievements'
import './AchievementsPage.css'

/** The player's achievements: how many are unlocked, the next goals ("Almost there") and every one with its progress. */
function AchievementsPage() {
  const { t: translate } = useTranslation('habits')
  const achievements = useAchievements()
  const { data } = achievements

  return (
    <main className="lm-achievements-page">
      <div className="lm-achievements-page__heading">
        <span className="lm-achievements-page__eyebrow">{translate('habits:module.name')}</span>
        <h1 className="lm-achievements-page__title">{translate('habits:achievements.title')}</h1>
        <p className="lm-achievements-page__intro">{translate('habits:achievements.intro')}</p>
        {data ? (
          <span className="lm-achievements-page__summary" data-tour="achievements.summary">
            <Icon name="trophy" size={16} className="lm-achievements-page__summary-icon" aria-hidden="true" />
            {translate('habits:achievements.summary', { unlocked: data.unlockedCount, total: data.total })}
          </span>
        ) : null}
      </div>

      {data ? <AchievementNearList achievements={data.achievements} /> : null}

      <AchievementGrid
        achievements={data?.achievements}
        status={achievements.status}
        isFetching={achievements.isFetching}
        onRetry={achievements.reload}
      />
    </main>
  )
}

export default AchievementsPage
