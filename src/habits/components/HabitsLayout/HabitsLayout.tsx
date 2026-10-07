import { Outlet } from 'react-router-dom'
import Footer from '../../../shared/components/Footer/Footer'
import Header from '../../../shared/components/Header/Header'
import { usePlayerProfile } from '../../hooks/usePlayerProfile'
import type { HabitsOutletContext } from '../../types/HabitsOutletContext'
import HabitsSidebar from '../HabitsSidebar/HabitsSidebar'
import PlayerHeader from '../PlayerHeader/PlayerHeader'
import './HabitsLayout.css'

/**
 * Shell shared by every Habits screen: header, module sidebar, the player's character, and the routed page via
 * `<Outlet />`. It owns the profile so every tab shows the same one; pages reload it through the outlet context.
 */
function HabitsLayout() {
  const { data: profile, status, reload } = usePlayerProfile()
  const outletContext: HabitsOutletContext = { profile, reloadProfile: reload }

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
    </div>
  )
}

export default HabitsLayout
