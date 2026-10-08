import type { WalletChangeDto } from '../types/HabitTodayDtos'

type Translate = (key: string, options?: Record<string, unknown>) => string

/** How many of the day's habits are done, and whether all of them are (false when there are none). */
export function todayProgress(items: readonly { done: boolean }[]) {
  const done = items.filter((item) => item.done).length
  return { done, total: items.length, allDone: items.length > 0 && done === items.length }
}

/** "+10 coins · +20 XP · +1 HP" (or the negative amounts after an undo); empty when nothing moved. */
export function formatWalletChange(wallet: WalletChangeDto, translate: Translate) {
  const parts: string[] = []
  if (wallet.coinsDelta !== 0) parts.push(translate('habits:today.reward.coins', { count: Math.abs(wallet.coinsDelta), value: signed(wallet.coinsDelta) }))
  if (wallet.xpDelta !== 0) parts.push(translate('habits:today.reward.xp', { value: signed(wallet.xpDelta) }))
  if (wallet.hpDelta !== 0) parts.push(translate('habits:today.reward.hp', { value: signed(wallet.hpDelta) }))
  return parts.join(' · ')
}

/** The toast's second line: a level up or a knockout, the moments worth more than the numbers. */
export function walletChangeHighlight(wallet: WalletChangeDto, translate: Translate) {
  if (wallet.knockedOut) return translate('habits:today.reward.knockedOut', { count: wallet.knockoutCoinsLost })
  if (wallet.levelsGained > 0) return translate('habits:today.reward.levelUp', { level: wallet.profile.level })
  return undefined
}

function signed(value: number) {
  return value > 0 ? `+${value}` : `−${Math.abs(value)}`
}

/** "Wednesday, October 7" for a `yyyy-MM-dd` day, in `locale`. */
export function formatDayTitle(date: string, locale: string) {
  const [year, month, day] = date.split('-').map(Number)
  const label = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(
    new Date(Date.UTC(year, month - 1, day)),
  )
  return label.charAt(0).toLocaleUpperCase(locale) + label.slice(1)
}
