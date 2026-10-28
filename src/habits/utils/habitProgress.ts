import type { HabitProgressEntryDto } from '../types/HabitTodayDtos'

/** A day's progress as the list shows it. */
export interface DayProgress {
  progress: number
  done: boolean
  /** Oldest first. */
  entries: HabitProgressEntryDto[]
}

/** A log or removal sent but not answered yet; `id` tells it apart from the others queued for the same day. */
export type PendingProgress =
  | { id: number; kind: 'add'; value: number }
  | { id: number; kind: 'remove'; entryId: number; value: number }

/** What is left to reach the target; 0 once it is reached. */
export function remaining(progress: number, target: number) {
  return Math.max(0, target - progress)
}

/** The share of the target, in whole percent, at most 100. */
export function progressPercent(progress: number, target: number) {
  return Math.min(100, Math.floor((progress / target) * 100))
}

export function formatAmount(value: number, language: string) {
  return new Intl.NumberFormat(language, { maximumFractionDigits: 0 }).format(value)
}

/**
 * The saved day with the pending changes applied, by the backend's rules: only a log completes a day that reaches the
 * target, and only a removal undoes a done day that falls below it.
 */
export function withPendingProgress(saved: DayProgress, pending: readonly PendingProgress[], target: number): DayProgress {
  return pending.reduce<DayProgress>((day, change) => {
    if (change.kind === 'add') {
      const progress = day.progress + change.value
      return { ...day, progress, done: day.done || progress >= target }
    }

    const progress = day.progress - change.value
    return {
      progress,
      done: day.done && progress >= target,
      entries: day.entries.filter((entry) => entry.id !== change.entryId),
    }
  }, saved)
}
