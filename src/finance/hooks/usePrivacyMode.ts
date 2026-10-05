import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'lm-finance-privacy'

const listeners = new Set<() => void>()

function readHidden(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

let hidden = readHidden()

function setHidden(next: boolean) {
  hidden = next
  try {
    localStorage.setItem(STORAGE_KEY, String(next))
  } catch {
    // Storage unavailable (e.g. private mode): the choice just won't survive a reload.
  }
  listeners.forEach((listener) => listener())
}

function onStorage(event: StorageEvent) {
  // Another tab toggled it: follow along so every open tab hides (or shows) the same.
  if (event.key !== STORAGE_KEY) return
  hidden = event.newValue === 'true'
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener('storage', onStorage)
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) window.removeEventListener('storage', onStorage)
  }
}

function getSnapshot() {
  return hidden
}

/**
 * Privacy mode: hides every amount in the Finance module (e.g. when the user is in public).
 * One state shared by every caller, persisted per device in `localStorage` and synced across tabs.
 */
export function usePrivacyMode() {
  const isHidden = useSyncExternalStore(subscribe, getSnapshot)

  function toggleHidden() {
    setHidden(!hidden)
  }

  return { hidden: isHidden, toggleHidden }
}
