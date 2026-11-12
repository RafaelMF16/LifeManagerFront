// Espelha LifeManager.Application/Push/DTOs
export interface PushPublicKeyDto {
  publicKey: string
}

export interface PushSubscriptionRequestDto {
  endpoint: string
  keys: { p256dh: string; auth: string }
  /** "Chrome · Android"; ≤ 60 characters, null when unknown. */
  label: string | null
}

export interface PushSubscriptionDeleteDto {
  endpoint: string
}

/** `GET /api/Push/PublicKey` without VAPID keys on the server (only in development). */
export const PUSH_NOT_CONFIGURED_CODE = 'Push.NotConfigured'
