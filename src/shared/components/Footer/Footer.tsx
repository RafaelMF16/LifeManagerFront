import { useTranslation } from 'react-i18next'
import './Footer.css'

function Footer() {
  const { t: translate } = useTranslation('common')

  return (
    <footer className="lm-footer">
      <span className="lm-footer__copyright">{translate('footer.copyright')}</span>
    </footer>
  )
}

export default Footer
