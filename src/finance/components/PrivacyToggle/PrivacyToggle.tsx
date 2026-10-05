import { useTranslation } from 'react-i18next'
import IconButton from '../../../shared/components/IconButton/IconButton'
import { usePrivacyMode } from '../../hooks/usePrivacyMode'

/** Header button that hides (or shows) every amount in the Finance module, for using it in public. */
function PrivacyToggle() {
  const { t: translate } = useTranslation('finance')
  const { hidden, toggleHidden } = usePrivacyMode()

  return (
    <IconButton
      icon={hidden ? 'eye-off' : 'eye'}
      label={translate(hidden ? 'finance:privacy.show' : 'finance:privacy.hide')}
      aria-pressed={hidden}
      onClick={toggleHidden}
    />
  )
}

export default PrivacyToggle
