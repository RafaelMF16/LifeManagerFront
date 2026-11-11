import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { defineConfig, loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// The local API, from .env (the development VITE_API_BASE_URL): the preview's /api proxy points at it.
const LOCAL_API = loadEnv('development', process.cwd(), 'VITE_').VITE_API_BASE_URL || 'https://localhost:7233'

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
  // `npm run preview` serves the production build, whose API calls are relative ("/api/...", Firebase Hosting's
  // rewrite in production): proxy them to the local API, so the preview is same-origin like production.
  preview: {
    proxy: {
      '/api': { target: LOCAL_API, changeOrigin: true, secure: false },
    },
  },
})
