import type { IconName } from '../../shared/components/Icon/Icon'

/** The icons a reward can pick, stored by id on the backend. `gift` is the default. */
export const REWARD_ICONS = [
  'gift',
  'gamepad-2',
  'tv',
  'coffee',
  'pizza',
  'bed',
  'shopping-bag',
  'ticket',
] as const satisfies readonly IconName[]

export type RewardIcon = (typeof REWARD_ICONS)[number]

export const DEFAULT_REWARD_ICON: RewardIcon = 'gift'

/** The icon to draw for a stored id: anything unknown (or none) falls back to the default. */
export function rewardIcon(id: string | null | undefined): RewardIcon {
  return REWARD_ICONS.find((icon) => icon === id) ?? DEFAULT_REWARD_ICON
}
