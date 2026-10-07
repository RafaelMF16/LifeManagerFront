import type { PlayerProfileDto } from './PlayerProfileDtos'

/** What `HabitsLayout` hands its child routes (`useOutletContext`): the profile it shows and a way to reload it. */
export interface HabitsOutletContext {
  profile: PlayerProfileDto | undefined
  /** Refetches the profile, e.g. after a check-in moved the coins, XP or HP. */
  reloadProfile: () => void
}
