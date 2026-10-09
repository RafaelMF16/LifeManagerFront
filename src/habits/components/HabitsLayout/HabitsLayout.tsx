import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Footer from '../../../shared/components/Footer/Footer'
import Header from '../../../shared/components/Header/Header'
import { usePlayerProfile } from '../../hooks/usePlayerProfile'
import type { HabitsOutletContext } from '../../types/HabitsOutletContext'
import {
  levelBaseline,
  pendingMoment,
  readSeenKnockout,
  readSeenLevel,
  writeSeenKnockout,
  writeSeenLevel,
} from '../../utils/gameMoments'
import GameMomentDialog from '../GameMomentDialog/GameMomentDialog'
import HabitsSidebar from '../HabitsSidebar/HabitsSidebar'
import PlayerHeader from '../PlayerHeader/PlayerHeader'
import './HabitsLayout.css'

/**
 * Shell shared by every Habits screen: header, module sidebar, the player's character, and the routed page via
 * `<Outlet />`. It owns the profile so every tab shows the same one; pages reload it through the outlet context. It
 * also stops the player for a knockout or a new level they haven't seen, whatever caused it and on whichever tab.
 */
function HabitsLayout() {
  const { data: profile, status, reload } = usePlayerProfile()
  const [seenKnockout, setSeenKnockout] = useState(readSeenKnockout)
  const [seenLevel, setSeenLevel] = useState(readSeenLevel)
  const outletContext: HabitsOutletContext = { profile, reloadProfile: reload }

  // Takes the profile's level as seen, without celebrating it, on a first visit, a new device or after an undone
  // level: adjusted during render (React's "storing information from previous renders"), before deriving the moment.
  const baseline = profile ? levelBaseline(profile.level, seenLevel) : null
  if (baseline !== null) setSeenLevel(baseline)

  const moment = profile ? pendingMoment(profile, seenKnockout, baseline ?? seenLevel) : null

  // Keeps this device's storage in step, so the next visit starts from what was already seen.
  useEffect(() => {
    if (seenLevel !== null) writeSeenLevel(seenLevel)
  }, [seenLevel])

  function closeMoment() {
    if (!moment) return
    if (moment.kind === 'knockout') {
      writeSeenKnockout(moment.knockout.id)
      setSeenKnockout(moment.knockout.id)
    } else {
      setSeenLevel(moment.level)
    }
  }

  return (
    <div className="lm-habits-layout">
      <Header />

      <div className="lm-habits-layout__body">
        <HabitsSidebar />

        <div className="lm-habits-layout__content">
          <div className="lm-habits-layout__player">
            <PlayerHeader profile={profile} status={status} />
          </div>
          <Outlet context={outletContext} />
          <Footer />
        </div>
      </div>

      {moment ? <GameMomentDialog key={moment.kind} moment={moment} onClose={closeMoment} /> : null}
    </div>
  )
}

export default HabitsLayout
