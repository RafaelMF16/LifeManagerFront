/**
 * The backend's VAPID public key (base64url, the 65-byte uncompressed P-256 point) as the bytes
 * `pushManager.subscribe({ applicationServerKey })` expects.
 */
export function vapidKeyToBytes(key: string): Uint8Array<ArrayBuffer> {
  const base64 = key.replace(/-/g, '+').replace(/_/g, '/').replace(/=+$/, '')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  const binary = atob(padded)

  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index)
  return bytes
}
