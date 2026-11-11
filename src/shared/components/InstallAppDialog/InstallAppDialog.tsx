import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../Button/Button'
import Dialog from '../Dialog/Dialog'
import Icon from '../Icon/Icon'
import './InstallAppDialog.css'

interface InstallAppDialogProps {
  onClose: () => void
}

/** Safari on iOS has no install prompt: the steps to add the app to the home screen. */
function InstallAppDialog({ onClose }: InstallAppDialogProps) {
  const { t: translate } = useTranslation('common')
  const titleId = useId()

  return (
    <Dialog labelledBy={titleId} onClose={onClose}>
      <div className="lm-dialog__header">
        <h2 id={titleId} className="lm-dialog__title">
          {translate('install.iosTitle')}
        </h2>
      </div>

      <div className="lm-dialog__body">
        <ol className="lm-install-steps">
          <li>
            <Icon name="share" size={18} aria-hidden="true" />
            <span>{translate('install.iosStepShare')}</span>
          </li>
          <li>
            <Icon name="square-plus" size={18} aria-hidden="true" />
            <span>{translate('install.iosStepAdd')}</span>
          </li>
          <li>
            <Icon name="check" size={18} aria-hidden="true" />
            <span>{translate('install.iosStepConfirm')}</span>
          </li>
        </ol>
      </div>

      <div className="lm-dialog__footer">
        <Button variant="primary" onClick={onClose}>
          {translate('install.iosClose')}
        </Button>
      </div>
    </Dialog>
  )
}

export default InstallAppDialog
