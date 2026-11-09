import './AppLogo.css'

// The right slice of the ring: 49.5° to 130.5° (a 9° gap between slices), radii 12 to 47, in a 100 × 100 box. The other
// three are this one rotated around the center.
const SLICE_PATH = 'M85.74 19.48A47 47 0 0 1 85.74 80.52L59.12 57.79A12 12 0 0 0 59.12 42.21Z'

// Clockwise from the right: Habits, an empty slice, Finance, an empty slice. A new module takes an empty one.
const SLICES = [
  { rotation: 0, tone: 'habits' },
  { rotation: 90, tone: 'free-1' },
  { rotation: 180, tone: 'finance' },
  { rotation: 270, tone: 'free-2' },
] as const

interface AppLogoProps {
  /** Width and height in px. */
  size?: number
}

/**
 * The app's mark, the same drawing as `public/favicon.svg`: four equal slices of a ring, one per area of life, with
 * Finance's wallet and Habits' check (lucide's paths). Decorative: it always sits next to the "LifeManager" name.
 */
function AppLogo({ size = 24 }: AppLogoProps) {
  return (
    <svg className="lm-app-logo" width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      {SLICES.map(({ rotation, tone }) => (
        <path
          key={tone}
          className={`lm-app-logo__slice lm-app-logo__slice--${tone}`}
          d={SLICE_PATH}
          transform={rotation === 0 ? undefined : `rotate(${rotation} 50 50)`}
        />
      ))}
      <g className="lm-app-logo__icons" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
        {/* lucide "check", 24 → 21 units, centered on the right slice (80, 50). */}
        <path transform="translate(69.5 39.5) scale(.875)" d="M20 6 9 17l-5-5" />
        {/* lucide "wallet", centered on the left slice (20, 50). */}
        <g transform="translate(9.5 39.5) scale(.875)">
          <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
          <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
        </g>
      </g>
    </svg>
  )
}

export default AppLogo
