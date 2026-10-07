import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import Icon from '../../../shared/components/Icon/Icon'
import type { IconName } from '../../../shared/components/Icon/Icon'
import type { PlayerProfileStatus } from '../../hooks/usePlayerProfile'
import type { PlayerProfileDto } from '../../types/PlayerProfileDtos'
import { progressRatio } from '../../utils/playerProgress'
import './PlayerHeader.css'

interface PlayerHeaderProps {
  profile: PlayerProfileDto | undefined
  status: PlayerProfileStatus
}

interface StatBarProps {
  kind: 'hp' | 'xp'
  icon: IconName
  label: string
  ariaLabel: string
  value: number
  max: number
  valueText: string
}

function StatBar({ kind, icon, label, ariaLabel, value, max, valueText }: StatBarProps) {
  const barStyle = { '--lm-bar': progressRatio(value, max) } as CSSProperties

  return (
    <div className={`lm-player-header__bar lm-player-header__bar--${kind}`}>
      <div className="lm-player-header__bar-top">
        <span className="lm-player-header__bar-label">
          <Icon name={icon} size={14} aria-hidden="true" />
          {label}
        </span>
        <span className="lm-player-header__bar-value">{valueText}</span>
      </div>
      <span
        className="lm-player-header__track"
        role="progressbar"
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={valueText}
      >
        <span className="lm-player-header__fill" style={barStyle} />
      </span>
    </div>
  )
}

/**
 * The player's character: level, coins, streak freezes, HP and XP. A placeholder of the same size while it loads,
 * nothing when it fails (the habits themselves still work).
 */
function PlayerHeader({ profile, status }: PlayerHeaderProps) {
  const { t: translate } = useTranslation('habits')

  if (status === 'error') return null

  if (!profile) {
    return (
      <section className="lm-player-header lm-player-header--loading" aria-busy="true">
        <span className="lm-player-header__visually-hidden">{translate('habits:player.loading')}</span>
        <div className="lm-player-header__top" aria-hidden="true">
          <span className="lm-player-header__placeholder lm-player-header__placeholder--badge" />
          <span className="lm-player-header__placeholder lm-player-header__placeholder--stats" />
        </div>
        <div className="lm-player-header__bars" aria-hidden="true">
          <span className="lm-player-header__placeholder lm-player-header__placeholder--bar" />
          <span className="lm-player-header__placeholder lm-player-header__placeholder--bar" />
        </div>
      </section>
    )
  }

  const { level, xpInLevel, xpToNextLevel, hp, maxHp, coins, streakFreezes, maxStreakFreezes } = profile

  return (
    <section className="lm-player-header" aria-label={translate('habits:player.aria')}>
      <div className="lm-player-header__top">
        <span className="lm-player-header__level" title={translate('habits:player.level', { level })}>
          <Icon name="sparkles" size={14} aria-hidden="true" />
          <span aria-hidden="true">{translate('habits:player.levelShort', { level })}</span>
          <span className="lm-player-header__visually-hidden">{translate('habits:player.level', { level })}</span>
        </span>

        <div className="lm-player-header__stats">
          <span className="lm-player-header__stat lm-player-header__stat--coins" title={translate('habits:player.coins')}>
            <Icon name="coins" size={16} aria-hidden="true" />
            <span aria-hidden="true">{coins}</span>
            <span className="lm-player-header__visually-hidden">
              {translate('habits:player.coinsAria', { count: coins })}
            </span>
          </span>
          <span className="lm-player-header__stat lm-player-header__stat--freezes" title={translate('habits:player.freezes')}>
            <Icon name="snowflake" size={16} aria-hidden="true" />
            <span aria-hidden="true">
              {translate('habits:player.freezesValue', { count: streakFreezes, max: maxStreakFreezes })}
            </span>
            <span className="lm-player-header__visually-hidden">
              {translate('habits:player.freezesAria', { count: streakFreezes, max: maxStreakFreezes })}
            </span>
          </span>
        </div>
      </div>

      <div className="lm-player-header__bars">
        <StatBar
          kind="hp"
          icon="heart"
          label={translate('habits:player.hp')}
          ariaLabel={translate('habits:player.hpAria')}
          value={hp}
          max={maxHp}
          valueText={translate('habits:player.hpValue', { hp, max: maxHp })}
        />
        <StatBar
          kind="xp"
          icon="sparkles"
          label={translate('habits:player.xp')}
          ariaLabel={translate('habits:player.xpAria', { next: level + 1 })}
          value={xpInLevel}
          max={xpToNextLevel}
          valueText={translate('habits:player.xpValue', { xp: xpInLevel, max: xpToNextLevel })}
        />
      </div>
    </section>
  )
}

export default PlayerHeader
