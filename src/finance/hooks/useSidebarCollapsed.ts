import { useEffect, useState } from 'react'

const STORAGE_KEY = 'lm-finance-sidebar-collapsed'

function getInitialCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState<boolean>(getInitialCollapsed)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed))
    } catch {
      // Storage unavailable (e.g. private mode): the choice just won't survive a reload.
    }
  }, [collapsed])

  function toggleCollapsed() {
    setCollapsed((current) => !current)
  }

  return { collapsed, toggleCollapsed }
}
