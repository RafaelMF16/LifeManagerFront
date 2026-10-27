import { Outlet } from 'react-router-dom'
import Footer from '../../../shared/components/Footer/Footer'
import Header from '../../../shared/components/Header/Header'
import TourButton from '../../../shared/components/Tour/TourButton'
import { FINANCE_TOURS } from '../../utils/financeTours'
import FinanceSidebar from '../FinanceSidebar/FinanceSidebar'
import PrivacyToggle from '../PrivacyToggle/PrivacyToggle'
import './FinanceLayout.css'

/** Shell shared by every Finance screen: header, module sidebar, and the routed page via `<Outlet />`. */
function FinanceLayout() {
  return (
    <div className="lm-finance-layout">
      <Header
        actions={
          <>
            <TourButton tours={FINANCE_TOURS} />
            <PrivacyToggle />
          </>
        }
      />

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
