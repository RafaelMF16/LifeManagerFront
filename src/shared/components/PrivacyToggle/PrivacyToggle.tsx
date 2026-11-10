import { useTranslation } from 'react-i18next'
import { usePrivacyMode } from '../../hooks/usePrivacyMode'
import IconButton from '../IconButton/IconButton'

/** Header button that hides (or shows) every amount (Finance and the Home), for using the app in public. */
function PrivacyToggle() {
  const { t: translate } = useTranslation('common')
  const { hidden, toggleHidden } = usePrivacyMode()

  return (
    <IconButton
      icon={hidden ? 'eye-off' : 'eye'}
      label={translate(hidden ? 'common:privacy.show' : 'common:privacy.hide')}
      aria-pressed={hidden}
      onClick={toggleHidden}
    />
  )
}

export default PrivacyToggle
