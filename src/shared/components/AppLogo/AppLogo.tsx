import { HelmHub, HelmShine, HelmWheel } from './HelmParts'

interface AppLogoProps {
  /** Width and height in px. */
  size?: number
}

/**
 * The app's mark, the same drawing as `public/favicon.svg`: a ship's helm ("you at the helm of your life"), drawn by
 * `HelmParts`, which `AnimatedHelm` also animates (the splash and the sign-in). Decorative: it always sits next to
 * the "LifeManager" name.
 */
function AppLogo({ size = 24 }: AppLogoProps) {
  return (
    <svg className="lm-app-logo" width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <HelmWheel />
      <HelmShine />
      <HelmHub />
    </svg>
  )
}

export default AppLogo
