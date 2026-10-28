import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Button from '../../../shared/components/Button/Button'
import Dialog from '../../../shared/components/Dialog/Dialog'
import type { AchievementCode } from '../../types/AchievementDtos'
import type { PlayerAvatar as PlayerAvatarCode, UpdateAppearanceRequestDto } from '../../types/PlayerProfileDtos'
import { achievementTitle } from '../../utils/achievements'
import { PLAYER_AVATARS, avatarName } from '../../utils/playerAvatars'
import PlayerAvatar from '../PlayerAvatar/PlayerAvatar'
import './AppearanceDialog.css'

interface AppearanceDialogProps {
  avatar: PlayerAvatarCode
  title: AchievementCode | null
  /** The titles the player unlocked, in catalog order; undefined while the achievements load or after they failed. */
  titles: AchievementCode[] | undefined
  /** The achievements couldn't load: the titles show an error with a retry instead of loading forever. */
  titlesFailed: boolean
  onRetryTitles: () => void
  onClose: () => void
  /** Saves it; the dialog stays open, with its button loading, until it settles. */
  onSave: (appearance: UpdateAppearanceRequestDto) => Promise<void>
}

/** Picks the avatar (all free) and the title (one of the unlocked achievements', or none). */
function AppearanceDialog({ avatar, title, titles, titlesFailed, onRetryTitles, onClose, onSave }: AppearanceDialogProps) {
  const { t: translate } = useTranslation('habits')
  const headingId = useId()
  const radioName = useId()
  const [pickedAvatar, setPickedAvatar] = useState(avatar)
  const [pickedTitle, setPickedTitle] = useState(title)
  const [saving, setSaving] = useState(false)
  const unchanged = pickedAvatar === avatar && pickedTitle === title

  async function save() {
    setSaving(true)
    try {
      await onSave({ avatar: pickedAvatar, title: pickedTitle })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog labelledBy={headingId} onClose={onClose} className="lm-appearance-dialog">
      <div className="lm-dialog__header">
        <h2 id={headingId} className="lm-dialog__title">
          {translate('habits:profile.appearance.title')}
        </h2>
      </div>

      <div className="lm-dialog__body lm-appearance-dialog__body">
        <fieldset className="lm-appearance-dialog__group">
          <legend className="lm-appearance-dialog__legend">{translate('habits:profile.appearance.avatar')}</legend>
          <div className="lm-appearance-dialog__avatars">
            {PLAYER_AVATARS.map((code) => (
              <label key={code} className="lm-appearance-dialog__avatar">
                <input
                  type="radio"
                  name={`${radioName}-avatar`}
                  value={code}
                  checked={pickedAvatar === code}
                  onChange={() => setPickedAvatar(code)}
                  className="lm-appearance-dialog__input"
                />
                <PlayerAvatar avatar={code} />
                <span className="lm-appearance-dialog__visually-hidden">{avatarName(code, translate)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="lm-appearance-dialog__group">
          <legend className="lm-appearance-dialog__legend">{translate('habits:profile.appearance.titleLabel')}</legend>
          {titles === undefined && titlesFailed ? (
            <div className="lm-appearance-dialog__error">
              <p className="lm-appearance-dialog__hint">{translate('habits:profile.appearance.titlesError')}</p>
              <Button variant="secondary" size="sm" onClick={onRetryTitles}>
                {translate('habits:profile.retry')}
              </Button>
            </div>
          ) : titles === undefined ? (
            <p className="lm-appearance-dialog__hint">{translate('habits:profile.appearance.titlesLoading')}</p>
          ) : (
            <div className="lm-appearance-dialog__titles">
              <label className="lm-appearance-dialog__title">
                <input
                  type="radio"
                  name={`${radioName}-title`}
                  checked={pickedTitle === null}
                  onChange={() => setPickedTitle(null)}
                />
                {translate('habits:profile.appearance.noTitle')}
              </label>
              {titles.map((code) => (
                <label key={code} className="lm-appearance-dialog__title">
                  <input
                    type="radio"
                    name={`${radioName}-title`}
                    value={code}
                    checked={pickedTitle === code}
                    onChange={() => setPickedTitle(code)}
                  />
                  {achievementTitle(code, translate)}
                </label>
              ))}
            </div>
          )}
          {titles?.length === 0 ? (
            <p className="lm-appearance-dialog__hint">
              {translate('habits:profile.appearance.noTitlesYet')}{' '}
              <Link to="/habits/achievements" onClick={onClose}>
                {translate('habits:profile.appearance.seeAchievements')}
              </Link>
            </p>
          ) : null}
        </fieldset>
      </div>

      <div className="lm-dialog__footer">
        <Button variant="secondary" onClick={onClose}>
          {translate('habits:actions.cancel')}
        </Button>
        <Button variant="primary" icon="check" loading={saving} disabled={unchanged} onClick={() => void save()}>
          {translate('habits:profile.appearance.save')}
        </Button>
      </div>
    </Dialog>
  )
}

export default AppearanceDialog
