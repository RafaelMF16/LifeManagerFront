import { Outlet } from 'react-router-dom'
import Footer from '../../../shared/components/Footer/Footer'
import Header from '../../../shared/components/Header/Header'
import FinanceSidebar from '../FinanceSidebar/FinanceSidebar'
import './FinanceLayout.css'

/** Shell shared by every Finance screen: header, module sidebar, and the routed page via `<Outlet />`. */
function FinanceLayout() {
  return (
    <div className="lm-finance-layout">
      <Header />

      <div className="lm-finance-layout__body">
        <FinanceSidebar />

        <div className="lm-finance-layout__content">
          <Outlet />
          <Footer />
        </div>
      </div>
    </div>
  )
}

export default FinanceLayout
