import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Icon from '../../../shared/components/Icon/Icon'
import Skeleton from '../../../shared/components/Skeleton/Skeleton'
import SkeletonGroup from '../../../shared/components/Skeleton/SkeletonGroup'
import type { AchievementsStatus } from '../../hooks/useAchievements'
import type { AchievementCode, AchievementDto, AchievementFamily } from '../../types/AchievementDtos'
import {
  achievementFamilyIcon,
  groupAchievementsByFamily,
  initiallyOpenFamilies,
  isUnlocked,
  nearestAchievements,
  unseenFamilies,
} from '../../utils/achievements'
import AchievementCard from './AchievementCard'
import AchievementCardSkeleton from './AchievementCardSkeleton'
import './AchievementGrid.css'

const COMPACT_QUERY = '(max-width: 768px)'
const SKELETON_CARDS = [0, 1, 2, 3]
const SKELETON_FAMILIES = [0, 1, 2, 3, 4]

/** Read once, when the grid first shows: which families start open doesn't follow later resizes. */
function isCompactScreen() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(COMPACT_QUERY).matches
}

/** The achievements' first load: closed family headers on compact screens, one family heading and its cards otherwise. */
function AchievementGridSkeleton({ label }: { label: string }) {
  if (isCompactScreen()) {
    return (
      <SkeletonGroup label={label} className="lm-achievement-grid__families">
        {SKELETON_FAMILIES.map((family) => (
          <div key={family} className="lm-achievement-grid__summary lm-achievement-grid__summary--skeleton">
            <Skeleton shape="circle" width={20} />
            <Skeleton width={family % 2 === 0 ? 120 : 96} />
          </div>
        ))}
      </SkeletonGroup>
    )
  }

  return (
    <SkeletonGroup label={label} className="lm-achievement-grid__family">
      <Skeleton width={120} height={16} />
      <div className="lm-achievement-grid__cards">
        {SKELETON_CARDS.map((card) => (
          <AchievementCardSkeleton key={card} index={card} />
        ))}
      </div>
    </SkeletonGroup>
  )
}

interface AchievementFamiliesProps {
  achievements: AchievementDto[]
  unseen: readonly AchievementCode[]
}

/**
 * One native `<details>` per family: the summary shows the family's icon, name, "3 of 5" and the medals won. Which
 * ones start open is decided on mount (`initiallyOpenFamilies`), plus the families of unseen unlocks that arrive later;
 * otherwise the player opens and closes them.
 */
function AchievementFamilies({ achievements, unseen }: AchievementFamiliesProps) {
  const { t: translate } = useTranslation('habits')
  const [openFamilies, setOpenFamilies] = useState(() =>
    initiallyOpenFamilies(achievements, nearestAchievements(achievements, 1), isCompactScreen(), unseen),
  )

  // Unseen unlocks can arrive after the mount (the profile loading late, or an unlock read meanwhile): their families
  // open too, adjusted during render. Only opens, never closes what the player opened.
  const unseenKey = unseen.join(',')
  const [openedForUnseen, setOpenedForUnseen] = useState(unseenKey)
  if (unseenKey !== openedForUnseen) {
    setOpenedForUnseen(unseenKey)
    const arrived = unseenFamilies(achievements, unseen)
    setOpenFamilies((current) => new Set([...current, ...arrived]))
  }

  function setOpen(family: AchievementFamily, open: boolean) {
    setOpenFamilies((current) => {
      if (current.has(family) === open) return current
      const next = new Set(current)
      if (open) next.add(family)
      else next.delete(family)
      return next
    })
  }

  return (
    <div className="lm-achievement-grid__families">
      {groupAchievementsByFamily(achievements).map((group) => {
        const unlocked = group.achievements.filter(isUnlocked)
        return (
          <details
            key={group.family}
            className="lm-achievement-grid__family"
            open={openFamilies.has(group.family)}
            onToggle={(event) => setOpen(group.family, event.currentTarget.open)}
          >
            <summary className="lm-achievement-grid__summary">
              <Icon name={achievementFamilyIcon(group.family)} size={18} className="lm-achievement-grid__summary-icon" aria-hidden="true" />
              <span className="lm-achievement-grid__family-title">{translate(`habits:achievements.families.${group.family}`)}</span>
              <span className="lm-achievement-grid__family-count lm-numeric">
                {translate('habits:achievements.grid.familyCount', { unlocked: unlocked.length, total: group.achievements.length })}
              </span>
              <span className="lm-achievement-grid__medals" aria-hidden="true">
                {unlocked.map((achievement) => (
                  <span key={achievement.code} className={`lm-achievement-grid__medal lm-achievement-grid__medal--${achievement.tier.toLowerCase()}`} />
                ))}
              </span>
              <Icon name="chevron-down" size={16} className="lm-achievement-grid__marker" aria-hidden="true" />
            </summary>
            <ul className="lm-achievement-grid__cards">
              {group.achievements.map((achievement) => (
                <AchievementCard key={achievement.code} achievement={achievement} />
              ))}
            </ul>
          </details>
        )
      })}
    </div>
  )
}

interface AchievementGridProps {
  achievements: AchievementDto[] | undefined
  /** Unlocks the player hasn't been shown yet (the profile's `newAchievements`): their families start open. */
  unseen: readonly AchievementCode[]
  status: AchievementsStatus
  isFetching: boolean
  onRetry: () => void
}

/** Every achievement, grouped by family in the catalog's order: locked ones grey with their progress, unlocked ones in color. */
function AchievementGrid({ achievements, unseen, status, isFetching, onRetry }: AchievementGridProps) {
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
      return <AchievementGridSkeleton label={translate('habits:achievements.loading')} />
    }

    return <AchievementFamilies achievements={achievements} unseen={unseen} />
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
