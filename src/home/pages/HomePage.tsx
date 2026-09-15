import Footer from '../../shared/components/Footer/Footer'
import Header from '../../shared/components/Header/Header'
import ModuleCard from '../components/ModuleCard/ModuleCard'
import type { HomeModule } from '../types/HomeModule'
import './HomePage.css'

const MODULES: HomeModule[] = [
  { id: 'financas', icon: 'wallet', ready: true },
  { id: 'habitos', icon: 'check', ready: false },
]

function HomePage() {
  return (
    <div className="lm-home-page">
      <Header />

      <main className="lm-home-page__main">
        <div className="lm-home-page__grid">
          {MODULES.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default HomePage
