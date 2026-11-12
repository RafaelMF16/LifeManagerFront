// Generates the PNG app icons from public/favicon.svg, rendered by headless Chrome (or Edge), so the PNGs match the SVG
// exactly. Run once and commit the PNGs; the build doesn't run it. Redo it if the SVG changes:
//   node scripts/generate-icons.mjs
// Set CHROME_PATH to use a browser this script doesn't find on its own.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const publicDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')
const svg = readFileSync(join(publicDir, 'favicon.svg'), 'utf8')

const candidates = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
]
const browser = candidates.find((path) => path && existsSync(path))
if (!browser) throw new Error('Chrome or Edge is needed to render the SVG (or set CHROME_PATH).')

const work = mkdtempSync(join(tmpdir(), 'lm-icons-'))

/**
 * Draws the SVG at `drawn` px, centered on a `canvas` px page: transparent, or on the light theme's --surface (white),
 * since iOS paints a transparent apple-touch-icon black. `filter` recolors the drawing (the white badge).
 */
function saveIcon(canvas, drawn, opaque, name, filter = 'none') {
  const background = opaque ? '#ffffff' : 'transparent'
  const page = join(work, `${basename(name)}.html`)
  writeFileSync(
    page,
    `<!doctype html><html><head><style>html,body{margin:0;width:${canvas}px;height:${canvas}px;overflow:hidden;` +
      `background:${background};display:grid;place-items:center}svg{width:${drawn}px;height:${drawn}px;display:block;filter:${filter}}` +
      `</style></head><body>${svg}</body></html>`,
  )
  const output = join(publicDir, name)
  execFileSync(browser, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--default-background-color=00000000',
    `--user-data-dir=${join(work, 'profile')}`,
    `--window-size=${canvas},${canvas}`,
    `--screenshot=${output}`,
    pathToFileURL(page).href,
  ], { stdio: 'ignore' })
  if (!existsSync(output)) throw new Error(`Rendering ${name} failed.`)
  console.log(`${name} (${canvas} x ${canvas})`)
}

try {
  saveIcon(64, 64, false, 'favicon.png')
  saveIcon(32, 32, false, 'favicon-32.png')
  // 144 of 180: the helm's margin on the home screen, like the other app icons.
  saveIcon(180, 144, true, 'apple-touch-icon.png')
  // The PWA's (public/manifest.webmanifest): "any" on a transparent page, and the maskable one with the helm at 360 of
  // 512 on white, inside the 80% safe zone the launcher may crop to a circle or a squircle.
  mkdirSync(join(publicDir, 'icons'), { recursive: true })
  saveIcon(192, 192, false, 'icons/icon-192.png')
  saveIcon(512, 512, false, 'icons/icon-512.png')
  saveIcon(512, 360, true, 'icons/icon-maskable-512.png')
  // The notification badge (Android's status bar, src/sw.ts): only the alpha counts, so the helm in white.
  saveIcon(96, 88, false, 'icons/badge-96.png', 'brightness(0) invert(1)')
} finally {
  rmSync(work, { recursive: true, force: true })
}
