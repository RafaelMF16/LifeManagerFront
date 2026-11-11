/** The `beforeinstallprompt` event (Chromium only, not in the DOM typings). */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const listeners = new Set<() => void>()
let promptEvent: BeforeInstallPromptEvent | null = null

function setPromptEvent(next: BeforeInstallPromptEvent | null) {
  promptEvent = next
  listeners.forEach((listener) => listener())
}

/**
 * Listens for the browser's install offer from `main.tsx`, before React mounts (the event may come early): keeps it
 * for the menu's "Install app" instead of the browser's own banner, and forgets it once the app is installed.
 * Returns the function that stops listening.
 */
export function listenForInstallPrompt(target: EventTarget = window): () => void {
  promptEvent = null

  function onPrompt(event: Event) {
    event.preventDefault()
    setPromptEvent(event as BeforeInstallPromptEvent)
  }

  function onInstalled() {
    setPromptEvent(null)
  }

  target.addEventListener('beforeinstallprompt', onPrompt)
  target.addEventListener('appinstalled', onInstalled)
  return () => {
    target.removeEventListener('beforeinstallprompt', onPrompt)
    target.removeEventListener('appinstalled', onInstalled)
  }
}

export function subscribeInstallPrompt(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Whether the browser's install prompt can be opened. */
export function getInstallPromptSnapshot(): boolean {
  return promptEvent !== null
}

/**
 * Opens the browser's install prompt. The event works once, so it is forgotten whatever the answer; null when there
 * is none to open or the browser refused to open it (the next `beforeinstallprompt` brings the item back).
 */
export async function promptInstall(): Promise<'accepted' | 'dismissed' | null> {
  const event = promptEvent
  if (!event) return null

  setPromptEvent(null)
  try {
    await event.prompt()
    return (await event.userChoice).outcome
  } catch {
    return null
  }
}
