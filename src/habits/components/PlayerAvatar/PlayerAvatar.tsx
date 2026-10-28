import Icon from '../../../shared/components/Icon/Icon'
import type { PlayerAvatar as PlayerAvatarCode } from '../../types/PlayerProfileDtos'
import { avatarLook } from '../../utils/playerAvatars'
import './PlayerAvatar.css'

interface PlayerAvatarProps {
  avatar: PlayerAvatarCode
  size?: 'sm' | 'md' | 'lg'
}

const ICON_SIZES = { sm: 16, md: 22, lg: 40 }

/** The player's avatar: its icon on a disc of its colour. Decorative; whoever shows it names it. */
function PlayerAvatar({ avatar, size = 'md' }: PlayerAvatarProps) {
  const { icon, tone } = avatarLook(avatar)

  return (
    <span className={`lm-player-avatar lm-player-avatar--${size} lm-player-avatar--tone-${tone}`} aria-hidden="true">
      <Icon name={icon} size={ICON_SIZES[size]} strokeWidth={size === 'lg' ? 1.75 : 1.5} />
    </span>
  )
}

export default PlayerAvatar
