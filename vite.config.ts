import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    basicSsl(),
    // The installable app: our own service worker (src/sw.ts, which habit-reminders extends with push) precaching the
    // built shell. The manifest is the static public/manifest.webmanifest, linked from index.html. Production builds
    // only: `npm run dev` registers nothing, so the PWA is checked with `npm run build && npm run preview`.
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'prompt',
      injectRegister: false,
      manifest: false,
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
      },
      devOptions: { enabled: false },
    }),
  ],
})
