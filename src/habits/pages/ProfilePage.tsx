import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router-dom'
import Button from '../../shared/components/Button/Button'
import { useCurrentUser } from '../../shared/hooks/useCurrentUser'
import { useErrorModal } from '../../shared/hooks/useErrorModal'
import { useToast } from '../../shared/hooks/useToast'
import { isSessionExpiredError } from '../../shared/services/httpClient'
import { isApiError } from '../../shared/types/ApiError'
import AppearanceDialog from '../components/AppearanceDialog/AppearanceDialog'
import PlayerAvatar from '../components/PlayerAvatar/PlayerAvatar'
import { useAchievements } from '../hooks/useAchievements'
import { usePlayerStats } from '../hooks/usePlayerStats'
import { updateAppearance } from '../services/playerProfileService'
import type { HabitsOutletContext } from '../types/HabitsOutletContext'
import type { UpdateAppearanceRequestDto } from '../types/PlayerProfileDtos'
import { achievementTitle } from '../utils/achievements'
import { formatPlayingSince, unlockedTitles } from '../utils/playerProfile'
import { appearanceErrorMessages } from '../validation/appearanceErrorMap'
import './ProfilePage.css'

/** Who the player is in the game and how far they came: identity, lifetime numbers, best achievements and evolution. */
function ProfilePage() {
  const { t: translate, i18n } = useTranslation(['habits', 'common'])
  const { profile, reloadProfile } = useOutletContext<HabitsOutletContext>()
  const { name } = useCurrentUser()
  const { show: showToast } = useToast()
  const { show: showErrorModal } = useErrorModal()
  const achievements = useAchievements()
  const stats = usePlayerStats()
  const [editing, setEditing] = useState(false)

  const titles = achievements.data ? unlockedTitles(achievements.data.achievements) : undefined

  async function handleSave(appearance: UpdateAppearanceRequestDto) {
    try {
      await updateAppearance(appearance)
      reloadProfile()
      setEditing(false)
      showToast(translate('habits:profile.appearance.saved'))
    } catch (err) {
      if (isSessionExpiredError(err)) return
      if (!isApiError(err)) {
        showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
        return
      }

      showErrorModal(
        translate('habits:profile.appearance.errorTitle'),
        translate(appearanceErrorMessages[err.code] ?? 'common:errors.generic'),
      )
      achievements.reload()
      reloadProfile()
    }
  }

  return (
    <main className="lm-profile-page">
      <div className="lm-profile-page__heading">
        <span className="lm-profile-page__eyebrow">{translate('habits:module.name')}</span>
        <h1 className="lm-profile-page__title">{translate('habits:profile.title')}</h1>
      </div>

      <section className="lm-profile-identity" aria-label={translate('habits:profile.identity.aria')} data-tour="profile.identity">
        {profile ? (
          <>
            <PlayerAvatar avatar={profile.avatar} size="lg" />
            <div className="lm-profile-identity__info">
              <span className="lm-profile-identity__name">{name ?? translate('habits:profile.identity.player')}</span>
              <span className={`lm-profile-identity__title${profile.title ? '' : ' lm-profile-identity__title--none'}`}>
                {profile.title ? achievementTitle(profile.title, translate) : translate('habits:profile.identity.noTitle')}
              </span>
              <span className="lm-profile-identity__meta">
                {translate('habits:player.level', { level: profile.level })}
                {stats.data?.playingSince
                  ? ` · ${translate('habits:profile.identity.playingSince', { date: formatPlayingSince(stats.data.playingSince, i18n.language) })}`
                  : null}
              </span>
            </div>
            <Button variant="secondary" size="sm" icon="pencil" className="lm-profile-identity__edit" onClick={() => setEditing(true)}>
              {translate('habits:profile.identity.edit')}
            </Button>
          </>
        ) : (
          <div className="lm-profile-identity__placeholder" aria-busy="true">
            <span className="lm-profile-page__visually-hidden">{translate('habits:profile.identity.loading')}</span>
          </div>
        )}
      </section>

      {editing && profile ? (
        <AppearanceDialog
          avatar={profile.avatar}
          title={profile.title}
          titles={titles}
          onClose={() => setEditing(false)}
          onSave={handleSave}
        />
      ) : null}
    </main>
  )
}

export default ProfilePage
