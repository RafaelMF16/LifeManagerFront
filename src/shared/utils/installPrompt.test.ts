import { describe, expect, it } from 'vitest'
import { installOption, isIosSafari } from './installPrompt'

const iphoneSafari =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
const iphoneChrome =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0.0.0 Mobile/15E148 Safari/604.1'
const ipadDesktopMode =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15'
const desktopChrome =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'

describe('isIosSafari', () => {
  it('reconhece o Safari do iPhone e o do iPad em modo desktop (com toque)', () => {
    expect(isIosSafari(iphoneSafari)).toBe(true)
    expect(isIosSafari(ipadDesktopMode, 5)).toBe(true)
  })

  it('não confunde com o Chrome do iOS, o Safari do Mac nem o Chrome do desktop', () => {
    expect(isIosSafari(iphoneChrome)).toBe(false)
    expect(isIosSafari(ipadDesktopMode, 0)).toBe(false)
    expect(isIosSafari(desktopChrome)).toBe(false)
  })
})

describe('installOption', () => {
  it('oferece o prompt nativo quando o navegador mandou o evento', () => {
    expect(installOption({ hasPromptEvent: true, userAgent: desktopChrome, standalone: false })).toBe('prompt')
  })

  it('mostra as instruções no Safari do iOS fora do app instalado', () => {
    expect(installOption({ hasPromptEvent: false, userAgent: iphoneSafari, standalone: false })).toBe('ios-instructions')
  })

  it('não oferece nada no Chrome do iOS, no desktop sem evento nem já instalado', () => {
    expect(installOption({ hasPromptEvent: false, userAgent: iphoneChrome, standalone: false })).toBeNull()
    expect(installOption({ hasPromptEvent: false, userAgent: desktopChrome, standalone: false })).toBeNull()
    expect(installOption({ hasPromptEvent: false, userAgent: iphoneSafari, standalone: true })).toBeNull()
    expect(installOption({ hasPromptEvent: true, userAgent: desktopChrome, standalone: true })).toBeNull()
  })
})
