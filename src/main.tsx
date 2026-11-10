import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n/i18n'
import App from './App.tsx'
import { listenForInstallPrompt } from './shared/services/installPromptStore'

// Before React mounts: the browser may offer the install right away.
listenForInstallPrompt()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
