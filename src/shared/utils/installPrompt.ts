/** How the menu offers to install the app: the browser's own prompt, the iOS steps, or nothing. */
export type InstallOption = 'prompt' | 'ios-instructions' | null

interface InstallContext {
  /** The browser sent `beforeinstallprompt` (Chrome, Edge, Android) and it wasn't used yet. */
  hasPromptEvent: boolean
  userAgent: string
  /** Already running as the installed app (`display-mode: standalone`, or `navigator.standalone` on iOS). */
  standalone: boolean
  /** `navigator.maxTouchPoints`: an iPad in desktop mode reports a Mac user agent. */
  maxTouchPoints?: number
}

// Other browsers on iOS (Chrome, Firefox, Edge, Opera, the Google app) can't add to the home screen the same way.
const OTHER_IOS_BROWSERS = /CriOS|FxiOS|EdgiOS|OPiOS|GSA\//

/** Safari on an iPhone/iPad, where installing is "Share → Add to Home Screen" (no prompt event). */
export function isIosSafari(userAgent: string, maxTouchPoints = 0): boolean {
  const ios = /iPhone|iPad|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && maxTouchPoints > 1)
  return ios && /Safari\//.test(userAgent) && !OTHER_IOS_BROWSERS.test(userAgent)
}

export function installOption({ hasPromptEvent, userAgent, standalone, maxTouchPoints }: InstallContext): InstallOption {
  if (standalone) return null
  if (hasPromptEvent) return 'prompt'
  return isIosSafari(userAgent, maxTouchPoints) ? 'ios-instructions' : null
}
