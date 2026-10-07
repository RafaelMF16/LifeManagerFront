import { useNavigate } from 'react-router-dom'
import Footer from '../../shared/components/Footer/Footer'
import Header from '../../shared/components/Header/Header'
import ModuleCard from '../components/ModuleCard/ModuleCard'
import type { HomeModule } from '../types/HomeModule'
import './HomePage.css'

const MODULES: HomeModule[] = [
  { id: 'financas', icon: 'wallet', ready: true, path: '/finance' },
  { id: 'habitos', icon: 'check', ready: true, path: '/habits' },
]

function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="lm-home-page">
      <Header />

      <main className="lm-home-page__main">
        <div className="lm-home-page__grid">
          {MODULES.map((module) => {
            const { path } = module
            return <ModuleCard key={module.id} module={module} onClick={path ? () => navigate(path) : undefined} />
          })}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default HomePage
