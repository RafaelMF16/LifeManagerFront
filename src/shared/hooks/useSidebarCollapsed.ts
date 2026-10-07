import { useEffect, useState } from 'react'

function getInitialCollapsed(storageKey: string): boolean {
  try {
    return localStorage.getItem(storageKey) === 'true'
  } catch {
    return false
  }
}

/** Whether a module's sidebar is collapsed to icons, persisted per module under `storageKey`. */
export function useSidebarCollapsed(storageKey: string) {
  const [collapsed, setCollapsed] = useState<boolean>(() => getInitialCollapsed(storageKey))

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, String(collapsed))
    } catch {
      // Storage unavailable (e.g. private mode): the choice just won't survive a reload.
    }
  }, [storageKey, collapsed])

  function toggleCollapsed() {
    setCollapsed((current) => !current)
  }

  return { collapsed, toggleCollapsed }
}
