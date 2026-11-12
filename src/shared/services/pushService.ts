import type { PushPublicKeyDto, PushSubscriptionRequestDto } from '../types/PushDtos'
import { deviceLabel, isIosDevice, pushSupportState } from '../utils/pushSupport'
import type { PushSupportState } from '../utils/pushSupport'
import { vapidKeyToBytes } from '../utils/vapidKey'
import { apiRequest } from './httpClient'
import { getAccessToken } from './tokenStorage'

const PUSH_PATH = '/api/Push'

/*
 * The habit reminders on this device: the browser's push subscription (`PushManager`, through the app's service
 * worker) and its copy on the backend (`/api/Push/Subscriptions`). Lives in shared/ because the logout, in
 * `authSession`, forgets it too.
 */

function isStandalone(): boolean {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true
  return iosStandalone || window.matchMedia('(display-mode: standalone)').matches
}

/**
 * The app's service worker, without waiting for one: `serviceWorker.ready` never settles where none is registered
 * (the dev server), so `getRegistration` is used instead.
 */
async function getRegistration(): Promise<ServiceWorkerRegistration | undefined> {
  if (!('serviceWorker' in navigator)) return undefined
  return navigator.serviceWorker.getRegistration()
}

async function getSubscription(): Promise<PushSubscription | null> {
  const registration = await getRegistration()
  return (await registration?.pushManager?.getSubscription()) ?? null
}

/** Reads what this device can do now (see `pushSupportState`). */
export async function readPushState(): Promise<PushSupportState> {
  const registration = await getRegistration()
  const hasNotification = 'Notification' in window
  const subscription = (await registration?.pushManager?.getSubscription()) ?? null

  return pushSupportState({
    hasServiceWorker: registration !== undefined,
    hasPushManager: 'PushManager' in window && registration?.pushManager !== undefined,
    hasNotification,
    ios: isIosDevice(navigator.userAgent, navigator.maxTouchPoints),
    standalone: isStandalone(),
    permission: hasNotification ? Notification.permission : 'default',
    subscribed: subscription !== null,
  })
}

function sameKey(subscription: PushSubscription, key: Uint8Array): boolean {
  const current = subscription.options.applicationServerKey
  if (!current) return false
  const bytes = new Uint8Array(current)
  return bytes.length === key.length && bytes.every((byte, index) => byte === key[index])
}

function toRequest(subscription: PushSubscription): PushSubscriptionRequestDto {
  const { endpoint, keys } = subscription.toJSON()
  if (!endpoint || !keys?.p256dh || !keys.auth) throw new Error('The browser returned a subscription without keys.')

  return { endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth }, label: deviceLabel(navigator.userAgent, navigator.maxTouchPoints) }
}

/**
 * "Turn on reminders": asks the permission (**only from a click**: browsers refuse or penalize asking unprompted),
 * subscribes with the backend's VAPID key and saves the device. Resolves to the permission when it isn't granted
 * (nothing else happens). An error of the backend (`Push.NotConfigured`, the connection) rejects; a subscription the
 * backend refused is undone, so the browser and the server never disagree.
 */
export async function enablePush(): Promise<NotificationPermission> {
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return permission

  const registration = await getRegistration()
  if (!registration) throw new Error('No service worker to receive notifications.')

  const { publicKey } = await apiRequest<PushPublicKeyDto>(`${PUSH_PATH}/PublicKey`, { method: 'GET' })
  const key = vapidKeyToBytes(publicKey)

  // A subscription made with another key (the server's pair changed) can't receive anything: replace it.
  let subscription = await registration.pushManager.getSubscription()
  if (subscription && !sameKey(subscription, key)) {
    await subscription.unsubscribe()
    subscription = null
  }
  subscription ??= await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key })

  try {
    await apiRequest<void>(`${PUSH_PATH}/Subscriptions`, { method: 'PUT', body: toRequest(subscription) })
  } catch (error) {
    await subscription.unsubscribe().catch(() => undefined)
    throw error
  }

  return permission
}

/**
 * "Turn off": removes the device from the backend and unsubscribes the browser. The browser side always goes, even
 * when the backend can't be reached: a push to an unsubscribed device answers 410 and the backend deletes it then.
 */
export async function disablePush(): Promise<void> {
  const subscription = await getSubscription()
  if (!subscription) return

  try {
    await apiRequest<void>(`${PUSH_PATH}/Subscriptions`, { method: 'DELETE', body: { endpoint: subscription.endpoint } })
  } finally {
    await subscription.unsubscribe().catch(() => undefined)
  }
}

/**
 * Before signing out: the next person on this phone must not get this account's reminders. The backend copy is
 * deleted only while this tab has an access token (otherwise a 401 would try a refresh and announce an expired
 * session in the middle of the logout); the browser subscription goes either way. Never throws.
 */
export async function forgetPushOnThisDevice(): Promise<void> {
  try {
    const subscription = await getSubscription()
    if (!subscription) return

    if (getAccessToken()) {
      await apiRequest<void>(`${PUSH_PATH}/Subscriptions`, { method: 'DELETE', body: { endpoint: subscription.endpoint } }).catch(
        () => undefined,
      )
    }
    await subscription.unsubscribe()
  } catch {
    // Signing out never depends on the notifications.
  }
}
