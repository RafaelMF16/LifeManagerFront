// Espelha os códigos de LifeManager.Domain/Habits/Errors/PlayerProfileErrors.cs
export const PLAYER_PROFILE_TITLE_LOCKED_CODE = 'PlayerProfile.TitleLocked'
export const PLAYER_PROFILE_UNKNOWN_AVATAR_CODE = 'PlayerProfile.UnknownAvatar'

/**
 * The message for each refusal of the appearance, as a translation key. Both come from a list older than the
 * backend's (a title shown before the page knew it was locked, an avatar from a newer version), so the page reloads.
 */
export const appearanceErrorMessages: Record<string, string> = {
  [PLAYER_PROFILE_TITLE_LOCKED_CODE]: 'habits:profile.appearance.errors.titleLocked',
  [PLAYER_PROFILE_UNKNOWN_AVATAR_CODE]: 'habits:profile.appearance.errors.unknownAvatar',
}
