import type { IconName } from '../../shared/components/Icon/Icon'
import type { PlayerAvatar } from '../types/PlayerProfileDtos'

type Translate = (key: string, options?: Record<string, unknown>) => string

/** One of the six avatar colours (`--avatar-tone-N` tokens); two avatars share each. */
export type AvatarTone = 1 | 2 | 3 | 4 | 5 | 6

interface AvatarLook {
  icon: IconName
  tone: AvatarTone
}

// In the backend's order (PlayerAvatar 1–12), which is also the picker's.
const AVATARS: Record<PlayerAvatar, AvatarLook> = {
  Cat: { icon: 'cat', tone: 1 },
  Dog: { icon: 'dog', tone: 2 },
  Bird: { icon: 'bird', tone: 3 },
  Rabbit: { icon: 'rabbit', tone: 4 },
  Fish: { icon: 'fish', tone: 5 },
  Turtle: { icon: 'turtle', tone: 6 },
  Squirrel: { icon: 'squirrel', tone: 1 },
  Panda: { icon: 'panda', tone: 2 },
  Rocket: { icon: 'rocket', tone: 3 },
  Flame: { icon: 'flame', tone: 4 },
  Mountain: { icon: 'mountain', tone: 5 },
  Bot: { icon: 'bot', tone: 6 },
}

export const PLAYER_AVATARS = Object.keys(AVATARS) as PlayerAvatar[]

/** The avatar's icon and colour; an unknown code (a newer backend) falls back to the default one. */
export const avatarLook = (avatar: PlayerAvatar): AvatarLook => AVATARS[avatar] ?? AVATARS.Cat

export const avatarName = (avatar: PlayerAvatar, translate: Translate) => translate(`habits:profile.avatars.${avatar}`)
