import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Icon from '../../../shared/components/Icon/Icon'
import type { IconName } from '../../../shared/components/Icon/Icon'
import type { PlayerStatsStatus } from '../../hooks/usePlayerStats'
import type { PlayerStatsDto } from '../../types/PlayerProfileDtos'
import './PlayerStatsGrid.css'

type StatKey = Exclude<keyof PlayerStatsDto, 'playingSince'> | 'totalXp'

// The order on screen: what was done, then how steady, then the economy. Labels: `habits:profile.stats.${key}`.
const STATS: { key: StatKey; icon: IconName }[] = [
  { key: 'checkIns', icon: 'check' },
  { key: 'cleanDays', icon: 'sparkles' },
  { key: 'activeDays', icon: 'calendar-check' },
  { key: 'totalXp', icon: 'trending-up' },
  { key: 'longestStreakDays', icon: 'flame' },
  { key: 'mostKeptDaysInOneHabit', icon: 'target' },
  { key: 'habitsCreated', icon: 'list-checks' },
  { key: 'achievementsUnlocked', icon: 'trophy' },
  { key: 'coinsEarned', icon: 'coins' },
  { key: 'coinsSpent', icon: 'shopping-bag' },
  { key: 'redemptions', icon: 'gift' },
  { key: 'knockouts', icon: 'heart' },
]

interface PlayerStatsGridProps {
  stats: PlayerStatsDto | undefined
  /** The profile's total XP (not part of the stats endpoint); undefined while it loads. */
  totalXp: number | undefined
  status: PlayerStatsStatus
  onRetry: () => void
}

/** The player's lifetime numbers, one tile each. Placeholders of the final size while they load. */
function PlayerStatsGrid({ stats, totalXp, status, onRetry }: PlayerStatsGridProps) {
  const { t: translate, i18n } = useTranslation('habits')
  const numberFormat = new Intl.NumberFormat(i18n.language)

  if (status === 'error' && !stats) {
    return (
      <div className="lm-player-stats__state">
        {translate('habits:profile.stats.loadError')}
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {translate('habits:profile.retry')}
        </Button>
      </div>
    )
  }

  return (
    <ul className="lm-player-stats" aria-busy={!stats}>
      {STATS.map(({ key, icon }) => {
        const value = key === 'totalXp' ? totalXp : stats?.[key]
        return (
          <li key={key} className={`lm-player-stats__tile lm-player-stats__tile--${key}`}>
            <Icon name={icon} size={18} className="lm-player-stats__icon" aria-hidden="true" />
            {value === undefined ? (
              <span className="lm-player-stats__placeholder" aria-hidden="true" />
            ) : (
              <span className="lm-player-stats__value">{numberFormat.format(value)}</span>
            )}
            <span className="lm-player-stats__label">{translate(`habits:profile.stats.${key}`)}</span>
          </li>
        )
      })}
    </ul>
  )
}

export default PlayerStatsGrid
