import { useSyncExternalStore } from 'react'
import { getInstallPromptSnapshot, promptInstall, subscribeInstallPrompt } from '../services/installPromptStore'
import { installOption } from '../utils/installPrompt'

function isStandalone(): boolean {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true
  return iosStandalone || window.matchMedia('(display-mode: standalone)').matches
}

/**
 * The menu's "Install app": `option` says how (the browser's prompt, the iOS steps) or null to hide it, and
 * `install` opens the browser's prompt (the event is listened for from `main.tsx`, `installPromptStore`).
 */
export function useInstallPrompt() {
  const hasPromptEvent = useSyncExternalStore(subscribeInstallPrompt, getInstallPromptSnapshot)
  const option = installOption({
    hasPromptEvent,
    userAgent: navigator.userAgent,
    standalone: isStandalone(),
    maxTouchPoints: navigator.maxTouchPoints,
  })

  return { option, install: promptInstall }
}
