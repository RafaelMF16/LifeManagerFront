import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import type { AchievementsStatus } from '../../hooks/useAchievements'
import type { AchievementDto } from '../../types/AchievementDtos'
import { groupAchievementsByFamily } from '../../utils/achievements'
import AchievementCard from './AchievementCard'
import './AchievementGrid.css'

interface AchievementGridProps {
  achievements: AchievementDto[] | undefined
  status: AchievementsStatus
  isFetching: boolean
  onRetry: () => void
}

/** Every achievement, grouped by family in the catalog's order: locked ones grey with their progress, unlocked ones in color. */
function AchievementGrid({ achievements, status, isFetching, onRetry }: AchievementGridProps) {
  const { t: translate } = useTranslation('habits')

  function renderBody() {
    if (status === 'loading' || !achievements) {
      if (status === 'error') {
        return (
          <div className="lm-achievement-grid__state">
            {translate('habits:achievements.loadError')}
            <Button variant="secondary" size="sm" onClick={onRetry}>
              {translate('habits:achievements.retry')}
            </Button>
          </div>
        )
      }
      return <div className="lm-achievement-grid__state">{translate('habits:achievements.loading')}</div>
    }

    return groupAchievementsByFamily(achievements).map((group) => (
      <section key={group.family} className="lm-achievement-grid__family" aria-labelledby={`lm-achievements-${group.family}`}>
        <h3 id={`lm-achievements-${group.family}`} className="lm-achievement-grid__family-title">
          {translate(`habits:achievements.families.${group.family}`)}
        </h3>
        <ul className="lm-achievement-grid__cards">
          {group.achievements.map((achievement) => (
            <AchievementCard key={achievement.code} achievement={achievement} />
          ))}
        </ul>
      </section>
    ))
  }

  return (
    <section className={`lm-achievement-grid${isFetching && status === 'ready' ? ' lm-achievement-grid--fetching' : ''}`} data-tour="achievements.grid">
      <div className="lm-achievement-grid__heading">
        <h2 className="lm-achievement-grid__title">{translate('habits:achievements.grid.title')}</h2>
        <p className="lm-achievement-grid__hint">{translate('habits:achievements.grid.hint')}</p>
      </div>
      <div className="lm-achievement-grid__body">{renderBody()}</div>
    </section>
  )
}

export default AchievementGrid
