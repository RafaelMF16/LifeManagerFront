import '../locales/register'
import { useTranslation } from 'react-i18next'
import Footer from '../../shared/components/Footer/Footer'
import Header from '../../shared/components/Header/Header'
import ProfileSection from '../components/ProfileSection/ProfileSection'
import SecuritySection from '../components/SecuritySection/SecuritySection'
import './AccountPage.css'

/** "My account": the name, the password and sessions, the data export and the account deletion. */
function AccountPage() {
  const { t: translate } = useTranslation('account')

  return (
    <div className="lm-account-page">
      <Header />

      <main className="lm-account-page__main">
        <div className="lm-account-page__heading">
          <h1 className="lm-account-page__title">{translate('account:title')}</h1>
          <p className="lm-account-page__subtitle">{translate('account:subtitle')}</p>
        </div>

        <ProfileSection />
        <SecuritySection />
      </main>

      <Footer />
    </div>
  )
}

export default AccountPage
