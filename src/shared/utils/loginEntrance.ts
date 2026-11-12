/**
 * Where the sign-in cover is, for the screen underneath: `hidden` while it covers the screen, `enter` once it opens
 * (the circle, or the fade), `null` without a sign-in going on.
 */
export type LoginEntrance = 'hidden' | 'enter' | null

/**
 * The class a screen puts around its `[data-enter]` blocks (`shared/styles/enter.css`). `fromLogin` is whether the
 * screen mounted under the sign-in cover: only then does it play the cascade, starting as the cover opens. A reload,
 * or reaching the screen from a menu, plays nothing.
 */
export function entranceClass(fromLogin: boolean, entrance: LoginEntrance): string {
  if (!fromLogin) return ''
  return entrance === 'hidden' ? 'lm-enter-pending' : 'lm-enter'
}
