import type { HabitAvoidItemDto } from '../types/HabitTodayDtos'

type Translate = (key: string, options?: Record<string, unknown>) => string

/**
 * What logging a relapse today will cost, said before confirming: the HP and the streak, or that a weekly limit still
 * has room (no HP lost; how many of the limit are left after this one).
 */
export function relapseCost(item: HabitAvoidItemDto, translate: Translate) {
  if (item.frequencyType === 'TimesPerWeek' && item.damagePreview === 0) {
    const left = Math.max((item.timesPerWeek ?? 0) - (item.weekRelapseCount ?? 0) - 1, 0)
    return translate('habits:today.relapse.withinLimit', { count: left })
  }

  return translate(item.currentStreak > 0 ? 'habits:today.relapse.costWithStreak' : 'habits:today.relapse.cost', {
    hp: item.damagePreview,
    count: item.currentStreak,
  })
}
