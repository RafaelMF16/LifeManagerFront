import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Footer from '../../../shared/components/Footer/Footer'
import Header from '../../../shared/components/Header/Header'
import TourButton from '../../../shared/components/Tour/TourButton'
import { usePlayerProfile } from '../../hooks/usePlayerProfile'
import { markAchievementsSeen } from '../../services/achievementService'
import type { HabitsOutletContext } from '../../types/HabitsOutletContext'
import {
  achievementsKey,
  levelBaseline,
  pendingMoment,
  readSeenKnockout,
  readSeenLevel,
  writeSeenKnockout,
  writeSeenLevel,
} from '../../utils/gameMoments'
import { HABITS_TOURS } from '../../utils/habitsTours'
import GameMomentDialog from '../GameMomentDialog/GameMomentDialog'
import HabitsSidebar from '../HabitsSidebar/HabitsSidebar'
import PlayerHeader from '../PlayerHeader/PlayerHeader'
import './HabitsLayout.css'

/**
 * Shell shared by every Habits screen: header, module sidebar, the player's character, and the routed page via
 * `<Outlet />`. It owns the profile so every tab shows the same one; pages reload it through the outlet context. It
 * also stops the player for a knockout, new achievements or a new level they haven't seen, whatever caused it and on
 * whichever tab.
 */
function HabitsLayout() {
  const { data: profile, status, reload } = usePlayerProfile()
  const [seenKnockout, setSeenKnockout] = useState(readSeenKnockout)
  const [seenLevel, setSeenLevel] = useState(readSeenLevel)
  // The set of achievements just closed: hidden at once while the backend marks them as seen and the profile reloads.
  const [closedAchievements, setClosedAchievements] = useState<string | null>(null)
  const navigate = useNavigate()
  const outletContext: HabitsOutletContext = { profile, reloadProfile: reload }

  // Takes the profile's level as seen, without celebrating it, on a first visit, a new device or after an undone
  // level: adjusted during render (React's "storing information from previous renders"), before deriving the moment.
  const baseline = profile ? levelBaseline(profile.level, seenLevel) : null
  if (baseline !== null) setSeenLevel(baseline)

  const moment = profile ? pendingMoment(profile, seenKnockout, baseline ?? seenLevel, closedAchievements) : null

  // Keeps this device's storage in step, so the next visit starts from what was already seen.
  useEffect(() => {
    if (seenLevel !== null) writeSeenLevel(seenLevel)
  }, [seenLevel])

  function closeMoment() {
    if (!moment) return
    if (moment.kind === 'knockout') {
      writeSeenKnockout(moment.knockout.id)
      setSeenKnockout(moment.knockout.id)
    } else if (moment.kind === 'achievements') {
      setClosedAchievements(achievementsKey(moment.achievements))
      // A failure leaves them unseen on the backend, so the moment comes back on the next visit.
      markAchievementsSeen(moment.achievements.map((achievement) => achievement.code)).then(reload, () => undefined)
    } else {
      setSeenLevel(moment.level)
    }
  }

  function seeAchievements() {
    closeMoment()
    navigate('/habits/achievements')
  }

  return (
    <div className="lm-habits-layout">
      <Header actions={<TourButton tours={HABITS_TOURS} />} />

      <div className="lm-habits-layout__body">
        <HabitsSidebar />

        <div className="lm-habits-layout__content">
          <div className="lm-habits-layout__player" data-tour="habits.player">
            <PlayerHeader profile={profile} status={status} />
          </div>
          <Outlet context={outletContext} />
          <Footer />
        </div>
      </div>

      {moment ? <GameMomentDialog key={moment.kind} moment={moment} onClose={closeMoment} onSeeAchievements={seeAchievements} /> : null}
    </div>
  )
}

export default HabitsLayout
