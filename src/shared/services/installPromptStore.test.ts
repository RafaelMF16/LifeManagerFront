import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getInstallPromptSnapshot, listenForInstallPrompt, promptInstall, subscribeInstallPrompt } from './installPromptStore'

function promptEvent(outcome: 'accepted' | 'dismissed' = 'accepted') {
  const event = new Event('beforeinstallprompt', { cancelable: true }) as Event & {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: string }>
  }
  event.prompt = vi.fn(() => Promise.resolve())
  event.userChoice = Promise.resolve({ outcome })
  return event
}

describe('installPromptStore', () => {
  let target: EventTarget
  let stop: () => void

  beforeEach(() => {
    stop?.()
    target = new EventTarget()
    stop = listenForInstallPrompt(target)
  })

  it('guarda o evento, impede o banner do navegador e avisa os assinantes', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeInstallPrompt(listener)
    const event = promptEvent()

    target.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
    expect(getInstallPromptSnapshot()).toBe(true)
    expect(listener).toHaveBeenCalledTimes(1)
    unsubscribe()
  })

  it('esquece o evento quando o app é instalado', () => {
    target.dispatchEvent(promptEvent())
    target.dispatchEvent(new Event('appinstalled'))

    expect(getInstallPromptSnapshot()).toBe(false)
  })

  it('abre o prompt uma vez e esquece o evento, aceito ou não', async () => {
    const event = promptEvent('dismissed')
    target.dispatchEvent(event)

    await expect(promptInstall()).resolves.toBe('dismissed')

    expect(event.prompt).toHaveBeenCalledTimes(1)
    expect(getInstallPromptSnapshot()).toBe(false)
    await expect(promptInstall()).resolves.toBeNull()
  })

  it('para de ouvir quando desligado', () => {
    stop()
    target.dispatchEvent(promptEvent())

    expect(getInstallPromptSnapshot()).toBe(false)
  })
})
