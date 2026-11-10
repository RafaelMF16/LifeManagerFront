import './AppLogo.css'

// The eight handles and spokes, one every 45°, each drawn pointing right and rotated around the center (50, 50).
const ANGLES = [0, 45, 90, 135, 180, 225, 270, 315] as const

const rotate = (angle: number) => (angle === 0 ? undefined : `rotate(${angle} 50 50)`)

interface AppLogoProps {
  /** Width and height in px. */
  size?: number
}

/**
 * The app's mark, the same drawing as `public/favicon.svg`: a ship's helm ("you at the helm of your life"), whose
 * pixel-art twin is the loading animation (`HelmSprite`). Decorative: it always sits next to the "LifeManager" name.
 */
function AppLogo({ size = 24 }: AppLogoProps) {
  return (
    <svg className="lm-app-logo" width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      {/* Outline under the handles and the rim. */}
      <g className="lm-app-logo__outline">
        {ANGLES.map((angle) => (
          <g key={angle} transform={rotate(angle)}>
            <path d="M78 50H91" strokeWidth={9} strokeLinecap="round" />
            <circle cx={91} cy={50} r={7} />
          </g>
        ))}
        <circle className="lm-app-logo__ring" cx={50} cy={50} r={27.5} strokeWidth={11} />
      </g>
      <g className="lm-app-logo__handles">
        {ANGLES.map((angle) => (
          <g key={angle} transform={rotate(angle)}>
            <path d="M78 50H91" strokeWidth={6} strokeLinecap="round" />
            <circle cx={91} cy={50} r={5.5} />
          </g>
        ))}
      </g>
      <g className="lm-app-logo__spokes" strokeWidth={4} strokeLinecap="round">
        {ANGLES.map((angle) => (
          <path key={angle} d="M58 50H74" transform={rotate(angle)} />
        ))}
      </g>
      {/* The rim, lit from the top left. */}
      <circle className="lm-app-logo__rim" cx={50} cy={50} r={27} strokeWidth={9} />
      <circle
        className="lm-app-logo__shine"
        cx={50}
        cy={50}
        r={25}
        strokeWidth={3.5}
        strokeLinecap="round"
        pathLength={360}
        strokeDasharray="70 290"
        transform="rotate(190 50 50)"
      />
      <circle className="lm-app-logo__hub" cx={50} cy={50} r={10} />
      <circle className="lm-app-logo__hub-face" cx={50} cy={50} r={6.5} />
      <circle className="lm-app-logo__hub-pin" cx={50} cy={50} r={3} />
    </svg>
  )
}

export default AppLogo
