import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Skeleton from '../../../shared/components/Skeleton/Skeleton'
import SkeletonGroup from '../../../shared/components/Skeleton/SkeletonGroup'
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
      ) : name === null || email === null ? (
        <SkeletonGroup label={translate('account:profile.loading')} className="lm-account-section__body">
          <div className="lm-account-row">
            <div className="lm-account-row__text">
              <Skeleton width={48} />
              <Skeleton width={160} />
            </div>
            <Skeleton shape="pill" width={88} height={32} />
          </div>
          <div className="lm-account-row">
            <div className="lm-account-row__text">
              <Skeleton width={48} />
              <Skeleton width={220} />
              <Skeleton width="80%" />
            </div>
          </div>
        </SkeletonGroup>
      ) : (
        <>
          <div className="lm-account-row">
            <div className="lm-account-row__text">
              <p className="lm-account-row__label">{translate('account:profile.nameLabel')}</p>
              <p className="lm-account-row__value">{name}</p>
            </div>
            <Button variant="secondary" size="sm" icon="pencil" onClick={() => setEditing(true)}>
              {translate('account:actions.edit')}
            </Button>
          </div>

          <div className="lm-account-row">
            <div className="lm-account-row__text">
              <p className="lm-account-row__label">{translate('account:profile.emailLabel')}</p>
              <p className="lm-account-row__value">{email}</p>
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
