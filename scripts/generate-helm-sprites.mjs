// Generates the pixel-art helm sprite strips in src/assets/helm/, the loading animations drawn by
// shared/components/HelmSprite/. Run once and commit the PNGs; the build doesn't run it. Redo it if the drawing changes:
//   node scripts/generate-helm-sprites.mjs
//
// Each strip is 24 frames of 64 px side by side (1536 × 64): a 32 × 32 pixel grid drawn at 2×, so the sprite stays
// sharp at any whole multiple of 64 px. The helm is in the brand's teal, inside a light round badge; the coins are the
// amber of the habits game's coins. Frame lengths live in src/shared/utils/spriteTimeline.ts.
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync } from 'node:zlib'

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'assets', 'helm')
const GRID = 32
const SCALE = 2
const FRAMES = 24
const CENTER = 16
const DEG = Math.PI / 180

const rgb = (hex) => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16), 255]
const COLOR = {
  badge: rgb('#eef2f6'),
  badgeLine: rgb('#94a3b8'),
  outline: rgb('#0b3b37'),
  teal50: rgb('#f0fdfa'),
  teal300: rgb('#5eead4'),
  teal400: rgb('#2dd4bf'),
  teal500: rgb('#14b8a6'),
  teal600: rgb('#0d9488'),
  teal700: rgb('#0f766e'),
  teal800: rgb('#115e59'),
  coin: rgb('#fbbf24'),
  coinShade: rgb('#f59e0b'),
  coinEdge: rgb('#b45309'),
  coinShine: rgb('#fef3c7'),
  spark: rgb('#fde68a'),
  white: rgb('#ffffff'),
}

const RIM_INNER = 6.6
const RIM_OUTER = 9.0
const HUB = 3.0
const KNOB_DISTANCE = 12.3
const KNOB_RADIUS = 1.45

/** The helm's color at a pixel, turned by `theta`; `glow` lights the hub up in amber (a coin just arrived). */
function helmColor(px, py, theta, glow) {
  const dx = px + 0.5 - CENTER
  const dy = py + 0.5 - CENTER
  const r = Math.hypot(dx, dy)
  // Light comes from the top left and doesn't turn with the helm.
  const lit = (-dx - dy) / (r || 1)

  if (r <= HUB) {
    if (r <= 1.2) return glow ? COLOR.coinShine : COLOR.teal700
    if (r <= 2.1) return glow ? COLOR.coin : COLOR.teal50
    return glow ? COLOR.coinShade : COLOR.teal600
  }
  if (r >= RIM_INNER && r <= RIM_OUTER) {
    if (lit > 0.5 && r < 7.9) return COLOR.teal300
    if (lit < -0.5 && r > 7.7) return COLOR.teal700
    return COLOR.teal500
  }

  let nearest = Infinity
  let along = 0
  for (let k = 0; k < 8; k++) {
    const spoke = theta + k * 45 * DEG
    // A round grip at the end of each spoke.
    const knobX = CENTER + Math.cos(spoke) * KNOB_DISTANCE - 0.5
    const knobY = CENTER + Math.sin(spoke) * KNOB_DISTANCE - 0.5
    const toKnob = Math.hypot(px - knobX, py - knobY)
    if (toKnob <= KNOB_RADIUS) return toKnob < 1 && px - knobX < 0.3 && py - knobY < 0.3 ? COLOR.teal400 : COLOR.teal600

    const across = Math.abs(dx * Math.sin(spoke) - dy * Math.cos(spoke))
    const lengthwise = dx * Math.cos(spoke) + dy * Math.sin(spoke)
    if (lengthwise > 0 && across < nearest) {
      nearest = across
      along = lengthwise
    }
  }
  // Thin spokes inside the rim, a thicker handle outside it.
  const outside = along > RIM_OUTER
  if (along > 2.8 && along < KNOB_DISTANCE && nearest <= (outside ? 0.8 : 0.55)) return outside ? COLOR.teal600 : COLOR.teal800
  return null
}

function coinColor(px, py, coin) {
  const dx = px + 0.5 - coin.x
  const dy = py + 0.5 - coin.y
  const d = Math.hypot(dx, dy)
  if (d > coin.r) return null
  if (coin.r >= 2 && d > coin.r - 0.9) return COLOR.coinEdge
  if (coin.r >= 2 && dx < -0.2 && dy < -0.2) return COLOR.coinShine
  return dx + dy > 0.8 ? COLOR.coinShade : COLOR.coin
}

/** A four-point sparkle of arm length `size`, white in the middle. */
function sparkColor(px, py, spark) {
  if (px === spark.x && py === spark.y) return COLOR.white
  const onArm = (px === spark.x && Math.abs(py - spark.y) <= spark.size) || (py === spark.y && Math.abs(px - spark.x) <= spark.size)
  return onArm ? COLOR.spark : null
}

const HELM = 1
const COIN = 2
const OUTLINE = 3
const NEIGHBORS = [[1, 0], [-1, 0], [0, 1], [0, -1]]

function renderFrame({ theta = 0, coins = [], glow = false, sparks = [] }) {
  const pixels = Array.from({ length: GRID }, () => Array(GRID).fill(null))
  const layer = Array.from({ length: GRID }, () => Array(GRID).fill(0))
  const each = (draw) => {
    for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) draw(x, y)
  }
  const touches = (x, y, kind) => NEIGHBORS.some(([ox, oy]) => layer[y + oy]?.[x + ox] === kind)

  each((x, y) => {
    const color = helmColor(x, y, theta, glow)
    if (color) {
      pixels[y][x] = color
      layer[y][x] = HELM
    }
  })
  // A one-pixel outline around the helm, left out between the spokes so the middle stays open.
  const helmEdge = []
  each((x, y) => {
    if (layer[y][x] === 0 && touches(x, y, HELM) && Math.hypot(x + 0.5 - CENTER, y + 0.5 - CENTER) > RIM_INNER - 0.2) {
      helmEdge.push([x, y])
    }
  })
  for (const [x, y] of helmEdge) {
    pixels[y][x] = COLOR.outline
    layer[y][x] = OUTLINE
  }

  for (const coin of coins) {
    each((x, y) => {
      const color = coinColor(x, y, coin)
      if (color) {
        pixels[y][x] = color
        layer[y][x] = COIN
      }
    })
  }
  const coinEdge = []
  each((x, y) => {
    if (layer[y][x] !== COIN && layer[y][x] !== HELM && touches(x, y, COIN)) coinEdge.push([x, y])
  })
  for (const [x, y] of coinEdge) pixels[y][x] = COLOR.outline

  for (const spark of sparks) {
    each((x, y) => {
      const color = sparkColor(x, y, spark)
      if (color) pixels[y][x] = color
    })
  }

  // The badge behind everything; nothing is drawn outside its circle.
  each((x, y) => {
    const d = Math.hypot(x + 0.5 - CENTER, y + 0.5 - CENTER)
    if (d > 15.6) pixels[y][x] = null
    else if (!pixels[y][x]) pixels[y][x] = d > 14.7 ? COLOR.badgeLine : COLOR.badge
  })
  return pixels
}

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeOut = (t) => 1 - Math.pow(1 - t, 3)
const lerp = (from, to, t) => from + (to - from) * t

/** A coin flying in an arc from (startX, startY) into the hub, shrinking on the way. */
function flyingCoin(t, startX, startY, lift) {
  const e = easeOut(t)
  return { x: lerp(startX, CENTER, e), y: lerp(startY, CENTER, e) - Math.sin(Math.PI * e) * lift, r: lerp(3.4, 1.8, e) }
}

/**
 * `loop`: the helm steers one spoke (45°, so the last frame meets the first) while two coins fly into the hub, one
 * from each side, and the hub lights up as each one lands.
 */
function loopFrames() {
  return Array.from({ length: FRAMES }, (_, i) => {
    const step = i % 12
    const t = step / 9
    const coins = t < 1 ? [i < 12 ? flyingCoin(t, -1, 9, 4) : flyingCoin(t, 33, 9, 4)] : []
    return { theta: easeInOut(i / FRAMES) * 45 * DEG, coins, glow: step === 9 || step === 10 }
  })
}

/**
 * `receive`: still (frame 0), a coin flies into the hub (1–13), the hub lights up while the helm turns a full circle
 * and settles (14–20), then sparkles around it (21–23, the last one held).
 */
function receiveFrames() {
  const sparkles = [
    [{ x: 5, y: 6, size: 1 }, { x: 26, y: 5, size: 1 }],
    [{ x: 5, y: 6, size: 2 }, { x: 26, y: 5, size: 2 }, { x: 27, y: 25, size: 1 }, { x: 4, y: 24, size: 1 }],
    [{ x: 6, y: 5, size: 1 }, { x: 25, y: 6, size: 1 }, { x: 27, y: 25, size: 2 }, { x: 4, y: 24, size: 2 }],
  ]
  return Array.from({ length: FRAMES }, (_, i) => {
    if (i === 0) return {}
    if (i <= 13) return { coins: [flyingCoin((i - 1) / 12, -1, 6, 6)] }
    if (i <= 20) return { theta: easeOut((i - 13) / 7) * 360 * DEG, glow: i <= 17 }
    return { sparks: sparkles[i - 21] }
  })
}

function stripPng(frames) {
  const width = FRAMES * GRID * SCALE
  const height = GRID * SCALE
  const rowBytes = width * 4 + 1 // each PNG row starts with its filter byte (0 = none)
  const raw = Buffer.alloc(rowBytes * height)
  frames.forEach((frame, index) => {
    const pixels = renderFrame(frame)
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        const color = pixels[y][x] ?? [0, 0, 0, 0]
        for (let sy = 0; sy < SCALE; sy++) {
          for (let sx = 0; sx < SCALE; sx++) {
            raw.set(color, (y * SCALE + sy) * rowBytes + 1 + ((index * GRID + x) * SCALE + sx) * 4)
          }
        }
      }
    }
  })
  return encodePng(width, height, raw)
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(bytes) {
  let c = 0xffffffff
  for (const byte of bytes) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function encodePng(width, height, raw) {
  const chunk = (type, data) => {
    const length = Buffer.alloc(4)
    length.writeUInt32BE(data.length)
    const body = Buffer.concat([Buffer.from(type), data])
    const crc = Buffer.alloc(4)
    crc.writeUInt32BE(crc32(body))
    return Buffer.concat([length, body, crc])
  }
  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header[8] = 8 // bit depth
  header[9] = 6 // RGBA
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

mkdirSync(OUT_DIR, { recursive: true })
writeFileSync(join(OUT_DIR, 'helm-loop.png'), stripPng(loopFrames()))
writeFileSync(join(OUT_DIR, 'helm-receive.png'), stripPng(receiveFrames()))
console.log(`helm-loop.png and helm-receive.png written to ${OUT_DIR}`)
