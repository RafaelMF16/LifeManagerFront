import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Skeleton from '../../../shared/components/Skeleton/Skeleton'
import { useCurrentUser } from '../../../shared/hooks/useCurrentUser'
import AccountSection from '../AccountSection/AccountSection'
import EditNameDialog from '../EditNameDialog/EditNameDialog'

/** The name (editable) and the e-mail (the sign-in, read only). */
function ProfileSection() {
  const { t: translate } = useTranslation('account')
  const { name, email, failed } = useCurrentUser()
  const [editing, setEditing] = useState(false)

  return (
    <AccountSection title={translate('account:profile.title')} icon="user" tourTarget="account.profile">
      {failed ? (
        <p className="lm-account-row__hint" role="alert">
          {translate('account:profile.loadError')}
        </p>
      ) : (
        <>
          <div className="lm-account-row">
            <div className="lm-account-row__text">
              <p className="lm-account-row__label">{translate('account:profile.nameLabel')}</p>
              <p className="lm-account-row__value">{name ?? <Skeleton width={140} />}</p>
            </div>
            <Button variant="secondary" size="sm" icon="pencil" disabled={!name} onClick={() => setEditing(true)}>
              {translate('account:actions.edit')}
            </Button>
          </div>

          <div className="lm-account-row">
            <div className="lm-account-row__text">
              <p className="lm-account-row__label">{translate('account:profile.emailLabel')}</p>
              <p className="lm-account-row__value">{email ?? <Skeleton width={200} />}</p>
              <p className="lm-account-row__hint">{translate('account:profile.emailHint')}</p>
            </div>
          </div>
        </>
      )}

      {editing && name ? <EditNameDialog name={name} onClose={() => setEditing(false)} /> : null}
    </AccountSection>
  )
}

export default ProfileSection
