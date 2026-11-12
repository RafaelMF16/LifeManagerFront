import { describe, expect, it } from 'vitest'
import { deviceLabel, isIosDevice, pushSupportState } from './pushSupport'

const supported = {
  hasServiceWorker: true,
  hasPushManager: true,
  hasNotification: true,
  ios: false,
  standalone: false,
  permission: 'default' as NotificationPermission,
  subscribed: false,
}

const IPHONE_SAFARI =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
const ANDROID_CHROME =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36'
const MAC_SAFARI =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15'
const WINDOWS_EDGE =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0'
const LINUX_FIREFOX = 'Mozilla/5.0 (X11; Linux x86_64; rv:132.0) Gecko/20100101 Firefox/132.0'

describe('pushSupportState', () => {
  it('is off while supported and not subscribed', () => {
    expect(pushSupportState(supported)).toBe('off')
  })

  it('is on when this device is subscribed with the permission granted', () => {
    expect(pushSupportState({ ...supported, permission: 'granted', subscribed: true })).toBe('on')
  })

  it('is off when a subscription is left but the permission was taken back to ask', () => {
    expect(pushSupportState({ ...supported, permission: 'default', subscribed: true })).toBe('off')
  })

  it('is denied when the browser blocks notifications', () => {
    expect(pushSupportState({ ...supported, permission: 'denied' })).toBe('denied')
  })

  it('asks to install on iOS outside the installed app, where push does not exist', () => {
    expect(pushSupportState({ ...supported, ios: true, hasPushManager: false, hasNotification: false })).toBe('ios-install')
  })

  it('works on iOS inside the installed app', () => {
    expect(pushSupportState({ ...supported, ios: true, standalone: true })).toBe('off')
  })

  it.each([
    { hasServiceWorker: false },
    { hasPushManager: false },
    { hasNotification: false },
  ])('is unsupported without %o', (missing) => {
    expect(pushSupportState({ ...supported, ...missing })).toBe('unsupported')
  })
})

describe('isIosDevice', () => {
  it('reads an iPhone and an iPad in desktop mode, but not a Mac', () => {
    expect(isIosDevice(IPHONE_SAFARI)).toBe(true)
    expect(isIosDevice(MAC_SAFARI, 5)).toBe(true)
    expect(isIosDevice(MAC_SAFARI, 0)).toBe(false)
    expect(isIosDevice(ANDROID_CHROME)).toBe(false)
  })
})

describe('deviceLabel', () => {
  it.each([
    [IPHONE_SAFARI, 0, 'Safari · iOS'],
    [ANDROID_CHROME, 5, 'Chrome · Android'],
    [MAC_SAFARI, 0, 'Safari · macOS'],
    [WINDOWS_EDGE, 0, 'Edge · Windows'],
    [LINUX_FIREFOX, 0, 'Firefox · Linux'],
  ])('names the browser and system of %s', (userAgent, touchPoints, expected) => {
    expect(deviceLabel(userAgent, touchPoints)).toBe(expected)
  })

  it('falls back to null for an unknown agent', () => {
    expect(deviceLabel('curl/8.0')).toBeNull()
  })
})
