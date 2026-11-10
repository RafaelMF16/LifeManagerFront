import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import Footer from '../../shared/components/Footer/Footer'
import Header from '../../shared/components/Header/Header'
import { useCurrentUser } from '../../shared/hooks/useCurrentUser'
import { readPendingInvite } from '../../shared/utils/pendingInvite'
import FinanceMonthCard from '../components/FinanceMonthCard/FinanceMonthCard'
import HabitsTodayCard from '../components/HabitsTodayCard/HabitsTodayCard'
import ModuleCard from '../components/ModuleCard/ModuleCard'
import { useHomeOverview } from '../hooks/useHomeOverview'
import type { HomeModule } from '../types/HomeModule'
import { greetingPeriod, todayLabel } from '../utils/greeting'
import './HomePage.css'

const MODULES: HomeModule[] = [
  { id: 'financas', icon: 'wallet', ready: true, path: '/finance' },
  { id: 'habitos', icon: 'check', ready: true, path: '/habits' },
]

/** The first screen after the login: the day's summary (habits and the current month) with shortcuts to act. */
function HomePage() {
  const { t: translate, i18n } = useTranslation('home')
  const navigate = useNavigate()
  const { name } = useCurrentUser()
  const { data, status, retry } = useHomeOverview()
  const greeting = translate(`greeting.${greetingPeriod(new Date())}`)

  // An invite link opened before a sign-up confirmed by e-mail: the login lands here, so carry on to the group.
  useEffect(() => {
    if (readPendingInvite()) navigate('/habits/ranking', { replace: true })
  }, [navigate])

  return (
    <div className="lm-home-page">
      <Header />

      <main className="lm-home-page__main">
        <div className="lm-home-page__greeting" data-tour="home.intro">
          <h1 className="lm-home-page__title">{name ? translate('greeting.withName', { greeting, name }) : greeting}</h1>
          {data ? <p className="lm-home-page__date">{todayLabel(data.today, i18n.language)}</p> : null}
        </div>

        <div className="lm-home-page__cards">
          <HabitsTodayCard overview={data} status={status} onRetry={retry} />
          <FinanceMonthCard overview={data} status={status} onRetry={retry} />
        </div>

        <section className="lm-home-page__modules" aria-labelledby="lm-home-modules-title">
          <h2 id="lm-home-modules-title" className="lm-home-page__section-title">
            {translate('modulesTitle')}
          </h2>
          <div className="lm-home-page__grid">
            {MODULES.map((module) => {
              const { path } = module
              return <ModuleCard key={module.id} module={module} compact onClick={path ? () => navigate(path) : undefined} />
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default HomePage
