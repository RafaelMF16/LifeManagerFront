import {
  ArrowDownLeft,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  ArrowUpRight,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Eye,
  EyeOff,
  Languages,
  LayoutDashboard,
  LogOut,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Plus,
  Search,
  Sun,
  Tags,
  Trash2,
  User,
  Wallet,
  X,
} from 'lucide-react'
import type { LucideProps } from 'lucide-react'

const ICONS = {
  wallet: Wallet,
  'arrow-up-narrow-wide': ArrowUpNarrowWide,
  'arrow-down-wide-narrow': ArrowDownWideNarrow,
  'arrow-down-left': ArrowDownLeft,
  'arrow-up-right': ArrowUpRight,
  sun: Sun,
  moon: Moon,
  check: Check,
  x: X,
  user: User,
  'chevron-down': ChevronDown,
  'chevron-up': ChevronUp,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  languages: Languages,
  'log-out': LogOut,
  calendar: Calendar,
  tags: Tags,
  'layout-dashboard': LayoutDashboard,
  'panel-left-close': PanelLeftClose,
  'panel-left-open': PanelLeftOpen,
  plus: Plus,
  search: Search,
  pencil: Pencil,
  'trash-2': Trash2,
  eye: Eye,
  'eye-off': EyeOff,
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
