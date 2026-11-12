/**
 * What the "Notifications" section can offer on this device:
 * - `unsupported`: no service worker, Push API or Notification (an old browser, or the dev server, which has no SW);
 * - `ios-install`: an iPhone/iPad outside the installed app, where Safari has no push at all (iOS ≥ 16.4 only has it
 *   in the app added to the home screen);
 * - `denied`: the browser blocks notifications for the site; only its settings can undo it;
 * - `off` / `on`: this device has no subscription, or has one with the permission granted.
 */
export type PushSupportState = 'unsupported' | 'ios-install' | 'denied' | 'off' | 'on'

export interface PushEnvironment {
  hasServiceWorker: boolean
  hasPushManager: boolean
  hasNotification: boolean
  ios: boolean
  /** Running as the installed app. */
  standalone: boolean
  /** `Notification.permission`; ignored when there is no Notification. */
  permission: NotificationPermission
  /** `pushManager.getSubscription()` found one. */
  subscribed: boolean
}

export function pushSupportState(environment: PushEnvironment): PushSupportState {
  if (environment.ios && !environment.standalone) return 'ios-install'
  if (!environment.hasServiceWorker || !environment.hasPushManager || !environment.hasNotification) return 'unsupported'
  if (environment.permission === 'denied') return 'denied'
  return environment.subscribed && environment.permission === 'granted' ? 'on' : 'off'
}

/** An iPhone, iPod or iPad (which reports a Mac user agent in desktop mode, told apart by its touch points). */
export function isIosDevice(userAgent: string, maxTouchPoints = 0): boolean {
  return /iPhone|iPad|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && maxTouchPoints > 1)
}

// Order matters: Edge and Opera also say "Chrome", Chrome also says "Safari".
const BROWSERS: [RegExp, string][] = [
  [/EdgA?\/|EdgiOS\//, 'Edge'],
  [/OPR\/|OPiOS\//, 'Opera'],
  [/SamsungBrowser\//, 'Samsung Internet'],
  [/Firefox\/|FxiOS\//, 'Firefox'],
  [/Chrome\/|CriOS\//, 'Chrome'],
  [/Safari\//, 'Safari'],
]

const SYSTEMS: [RegExp, string][] = [
  [/Android/, 'Android'],
  [/Windows/, 'Windows'],
  [/CrOS/, 'ChromeOS'],
  [/Macintosh/, 'macOS'],
  [/Linux/, 'Linux'],
]

/** "Chrome · Android": the device's name in the backend's list (`label`, ≤ 60 characters); null when unknown. */
export function deviceLabel(userAgent: string, maxTouchPoints = 0): string | null {
  const browser = BROWSERS.find(([pattern]) => pattern.test(userAgent))?.[1]
  const system = isIosDevice(userAgent, maxTouchPoints) ? 'iOS' : SYSTEMS.find(([pattern]) => pattern.test(userAgent))?.[1]

  if (!browser && !system) return null
  return [browser, system].filter(Boolean).join(' · ')
}
