import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import AccountSection from '../AccountSection/AccountSection'
import DeleteAccountDialog from '../DeleteAccountDialog/DeleteAccountDialog'

/** The account's deletion, apart from everything else and in red. */
function DangerZoneSection() {
  const { t: translate } = useTranslation('account')
  const [deleting, setDeleting] = useState(false)

  return (
    <AccountSection title={translate('account:danger.title')} icon="triangle-alert" danger tourTarget="account.danger">
      <div className="lm-account-row">
        <div className="lm-account-row__text">
          <p className="lm-account-row__value">{translate('account:danger.label')}</p>
          <p className="lm-account-row__hint">{translate('account:danger.description')}</p>
        </div>
        <Button variant="destructive" size="sm" icon="trash-2" onClick={() => setDeleting(true)}>
          {translate('account:danger.action')}
        </Button>
      </div>

      {deleting ? <DeleteAccountDialog onClose={() => setDeleting(false)} /> : null}
    </AccountSection>
  )
}

export default DangerZoneSection
