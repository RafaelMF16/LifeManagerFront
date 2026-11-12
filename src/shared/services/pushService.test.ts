import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readPushOwner, savePushOwner } from '../utils/pushOwner'
import { apiRequest } from './httpClient'
import { disablePush, enablePush, forgetPushOnThisDevice, readPushState, releasePushOfOtherAccount } from './pushService'
import { clearAccessToken, setAccessToken } from './tokenStorage'

vi.mock('./httpClient', () => ({ apiRequest: vi.fn() }))

const ENDPOINT = 'https://fcm.googleapis.com/fcm/send/device'
const SERVER_KEY = new Uint8Array(65).fill(4)
const OTHER_KEY = new Uint8Array(65).fill(9)
const SERVER_KEY_BASE64URL = btoa(String.fromCharCode(...SERVER_KEY)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

function tokenFor(userId: string): string {
  const payload = btoa(JSON.stringify({ nameid: userId })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `header.${payload}.signature`
}

function fakeSubscription(key: Uint8Array = SERVER_KEY) {
  return {
    endpoint: ENDPOINT,
    options: { applicationServerKey: key.slice().buffer },
    toJSON: () => ({ endpoint: ENDPOINT, keys: { p256dh: 'p256dh-key', auth: 'auth-key' } }),
    unsubscribe: vi.fn().mockResolvedValue(true),
  }
}

type FakeSubscription = ReturnType<typeof fakeSubscription>

let current: FakeSubscription | null
let created: FakeSubscription
const pushManager = {
  getSubscription: vi.fn(async () => current),
  subscribe: vi.fn(async () => created),
}
const requestPermission = vi.fn<() => Promise<NotificationPermission>>()
const api = vi.mocked(apiRequest)

function stubBrowser(permission: NotificationPermission = 'granted') {
  const store = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
  })
  const notification = { permission, requestPermission }
  vi.stubGlobal('Notification', notification)
  vi.stubGlobal('window', {
    Notification: notification,
    PushManager: function PushManager() {},
    matchMedia: () => ({ matches: false }),
  })
  vi.stubGlobal('navigator', {
    userAgent: 'Mozilla/5.0 (Linux; Android 14) Chrome/130.0.0.0 Mobile Safari/537.36',
    maxTouchPoints: 5,
    serviceWorker: { getRegistration: async () => ({ pushManager }) },
  })
}

beforeEach(() => {
  stubBrowser()
  current = null
  created = fakeSubscription()
  pushManager.getSubscription.mockClear()
  pushManager.subscribe.mockClear()
  requestPermission.mockReset().mockResolvedValue('granted')
  api.mockReset().mockImplementation(async (path) => (path === '/api/Push/PublicKey' ? { publicKey: SERVER_KEY_BASE64URL } : undefined))
  setAccessToken(tokenFor('42'))
})

afterEach(() => {
  clearAccessToken()
  vi.unstubAllGlobals()
})

const callsTo = (path: string) => api.mock.calls.filter(([calledPath]) => calledPath === path)

describe('enablePush', () => {
  it('subscribes with the server key, saves the device and marks this account as its owner', async () => {
    await expect(enablePush()).resolves.toBe('granted')

    expect(pushManager.subscribe).toHaveBeenCalledWith({ userVisibleOnly: true, applicationServerKey: SERVER_KEY })
    expect(callsTo('/api/Push/Subscriptions')).toEqual([
      [
        '/api/Push/Subscriptions',
        {
          method: 'PUT',
          body: { endpoint: ENDPOINT, keys: { p256dh: 'p256dh-key', auth: 'auth-key' }, label: 'Chrome · Android' },
        },
      ],
    ])
    expect(readPushOwner()).toBe('42')
  })

  it('does nothing else when the permission is not granted', async () => {
    requestPermission.mockResolvedValue('denied')

    await expect(enablePush()).resolves.toBe('denied')

    expect(api).not.toHaveBeenCalled()
    expect(pushManager.subscribe).not.toHaveBeenCalled()
  })

  it('keeps a subscription made with the same key', async () => {
    current = fakeSubscription()

    await enablePush()

    expect(current.unsubscribe).not.toHaveBeenCalled()
    expect(pushManager.subscribe).not.toHaveBeenCalled()
  })

  it('replaces a subscription made with another key', async () => {
    const stale = fakeSubscription(OTHER_KEY)
    current = stale

    await enablePush()

    expect(stale.unsubscribe).toHaveBeenCalled()
    expect(pushManager.subscribe).toHaveBeenCalled()
  })

  it('undoes the subscription when the server refuses it', async () => {
    const refusal = { code: 'Push.InvalidEndpoint', message: 'Invalid', type: 'Validation' }
    api.mockImplementation(async (path) => {
      if (path === '/api/Push/PublicKey') return { publicKey: SERVER_KEY_BASE64URL }
      throw refusal
    })

    await expect(enablePush()).rejects.toBe(refusal)

    expect(created.unsubscribe).toHaveBeenCalled()
    expect(readPushOwner()).toBeNull()
  })
})

describe('disablePush', () => {
  it('unsubscribes the browser even when the server cannot be reached', async () => {
    current = fakeSubscription()
    savePushOwner('42')
    api.mockRejectedValue(new Error('offline'))

    await expect(disablePush()).rejects.toThrow('offline')

    expect(current.unsubscribe).toHaveBeenCalled()
    expect(readPushOwner()).toBeNull()
  })
})

describe('forgetPushOnThisDevice', () => {
  it('deletes the device without a token refresh and unsubscribes', async () => {
    current = fakeSubscription()
    savePushOwner('42')

    await forgetPushOnThisDevice()

    const [[, options]] = callsTo('/api/Push/Subscriptions')
    expect(options).toMatchObject({ method: 'DELETE', body: { endpoint: ENDPOINT }, renewOnUnauthorized: false })
    expect(options.signal).toBeInstanceOf(AbortSignal)
    expect(current.unsubscribe).toHaveBeenCalled()
    expect(readPushOwner()).toBeNull()
  })

  it('only unsubscribes without an access token', async () => {
    current = fakeSubscription()
    clearAccessToken()

    await forgetPushOnThisDevice()

    expect(api).not.toHaveBeenCalled()
    expect(current.unsubscribe).toHaveBeenCalled()
  })

  it('never throws', async () => {
    current = fakeSubscription()
    api.mockRejectedValue(new Error('offline'))
    current.unsubscribe.mockRejectedValue(new Error('broken'))

    await expect(forgetPushOnThisDevice()).resolves.toBeUndefined()
  })
})

describe('releasePushOfOtherAccount', () => {
  it('keeps the subscription of the account signing in', async () => {
    current = fakeSubscription()
    savePushOwner('42')

    await releasePushOfOtherAccount('42')

    expect(current.unsubscribe).not.toHaveBeenCalled()
    expect(readPushOwner()).toBe('42')
  })

  it.each([
    ['another account', '7', '42'],
    ['no known account', null, '42'],
    ['an unknown account when the token is unreadable', null, null],
  ])('drops the subscription of %s', async (_, owner, signingIn) => {
    current = fakeSubscription()
    if (owner) savePushOwner(owner)

    await releasePushOfOtherAccount(signingIn)

    expect(current.unsubscribe).toHaveBeenCalled()
    expect(readPushOwner()).toBeNull()
  })
})

describe('readPushState', () => {
  it('is on with a subscription of the signed-in account', async () => {
    current = fakeSubscription()
    savePushOwner('42')

    await expect(readPushState()).resolves.toEqual({ state: 'on', subscribed: true })
  })

  it('reads a subscription of another account as none', async () => {
    current = fakeSubscription()
    savePushOwner('7')

    await expect(readPushState()).resolves.toEqual({ state: 'off', subscribed: false })
  })

  it('tells a blocked device that still has its subscription', async () => {
    stubBrowser('denied')
    current = fakeSubscription()
    savePushOwner('42')

    await expect(readPushState()).resolves.toEqual({ state: 'denied', subscribed: true })
  })
})
