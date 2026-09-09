import { Check, Moon, Sun, Wallet, X } from 'lucide-react'
import type { LucideProps } from 'lucide-react'

const ICONS = {
  wallet: Wallet,
  sun: Sun,
  moon: Moon,
  check: Check,
  x: X,
} as const

export type IconName = keyof typeof ICONS

interface IconProps extends Omit<LucideProps, 'size' | 'strokeWidth'> {
  name: IconName
  size?: number
  strokeWidth?: number
}

function Icon({ name, size = 16, strokeWidth = 1.5, ...rest }: IconProps) {
  const LucideIcon = ICONS[name]
  return <LucideIcon size={size} strokeWidth={strokeWidth} {...rest} />
}

export default Icon
