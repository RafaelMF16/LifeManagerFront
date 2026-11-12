import { describe, expect, it } from 'vitest'
import { vapidKeyToBytes } from './vapidKey'

describe('vapidKeyToBytes', () => {
  it('decodes base64url without padding', () => {
    // "-_8" is base64url for 0xFB 0xFF ("+/8" in plain base64).
    expect(Array.from(vapidKeyToBytes('-_8'))).toEqual([0xfb, 0xff])
  })

  it('accepts padding', () => {
    expect(Array.from(vapidKeyToBytes('AQI='))).toEqual([1, 2])
  })

  it('decodes a 65-byte public key starting with 0x04', () => {
    const key = 'BC9qRGdfGQdHJJN39NH4P0CdqV5A1RUiRyL7Rt1aKrbBIxmHB-9N1H9alTGDlSixhx3IO9M4g_si3qv0J6Xk1GY'
    const bytes = vapidKeyToBytes(key)

    expect(bytes).toHaveLength(65)
    expect(bytes[0]).toBe(4)
  })
})
