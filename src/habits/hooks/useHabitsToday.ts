import { useCallback, useEffect, useRef, useState } from 'react'
import { checkIn, getToday, undoCheckIn } from '../services/habitCheckInService'
import { relapse as relapseRequest, undoRelapse as undoRelapseRequest } from '../services/habitRelapseService'
import type {
  HabitAvoidItemDto,
  HabitCheckInResultDto,
  HabitRelapseResultDto,
  HabitTodayDto,
  HabitTodayItemDto,
} from '../types/HabitTodayDtos'

export type HabitsTodayStatus = 'loading' | 'ready' | 'error'

interface FetchResult {
  /** Which load this outcome belongs to, so a stale one is never shown as current. */
  key: number
  data?: HabitTodayDto
  failed: boolean
}

function toggleKey(habitId: number, date: string) {
  return `${habitId}:${date}`
}

/**
 * The day's checklist. `toggle` checks a habit in (or undoes it) optimistically: the item flips at once and flips
 * back if the request fails. `setRelapse` logs (or undoes) a relapse of a habit to avoid and waits for the server,
 * since it costs HP. A habit already being saved ignores further taps.
 */
export function useHabitsToday() {
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<FetchResult | null>(null)
  // Optimistic "done" values, kept until the list reloads with the saved state.
  const [overrides, setOverrides] = useState<Record<string, boolean>>({})
  const [pending, setPending] = useState<ReadonlySet<string>>(new Set())
  // Read synchronously by toggle, so a double tap is caught before React re-renders.
  const pendingRef = useRef(new Set<string>())

  useEffect(() => {
    // Aborted on reload or unmount, which also fires the backend's CancellationToken.
    const controller = new AbortController()

    getToday(controller.signal).then(
      (data) => {
        if (controller.signal.aborted) return
        setResult({ key: reloadKey, data, failed: false })
        // The saved state replaces the optimistic one, except for habits whose own save is still running.
        setOverrides((current) =>
          Object.fromEntries(Object.entries(current).filter(([key]) => pendingRef.current.has(key))),
        )
      },
      () => {
        if (!controller.signal.aborted) setResult((previous) => ({ key: reloadKey, data: previous?.data, failed: true }))
      },
    )

    return () => controller.abort()
  }, [reloadKey])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  const toggle = useCallback(
    async (item: HabitTodayItemDto, date: string): Promise<HabitCheckInResultDto | undefined> => {
      const key = toggleKey(item.id, date)
      if (pendingRef.current.has(key)) return undefined

      pendingRef.current.add(key)
      setPending(new Set(pendingRef.current))
      setOverrides((current) => ({ ...current, [key]: !item.done }))

      try {
        const saved = item.done ? await undoCheckIn(item.id, date) : await checkIn(item.id, date)
        reload()
        return saved
      } catch (err) {
        setOverrides((current) => {
          const next = { ...current }
          delete next[key]
          return next
        })
        throw err
      } finally {
        pendingRef.current.delete(key)
        setPending(new Set(pendingRef.current))
      }
    },
    [reload],
  )

  const setRelapse = useCallback(
    async (item: HabitAvoidItemDto, date: string, relapsed: boolean): Promise<HabitRelapseResultDto | undefined> => {
      const key = toggleKey(item.id, date)
      if (pendingRef.current.has(key)) return undefined

      pendingRef.current.add(key)
      setPending(new Set(pendingRef.current))

      try {
        const saved = relapsed ? await relapseRequest(item.id, date) : await undoRelapseRequest(item.id, date)
        reload()
        return saved
      } finally {
        pendingRef.current.delete(key)
        setPending(new Set(pendingRef.current))
      }
    },
    [reload],
  )

  const data = result?.data
  const status: HabitsTodayStatus = data ? 'ready' : result?.failed ? 'error' : 'loading'

  const withOverrides = (items: HabitTodayItemDto[], date: string) =>
    items.map((item) => {
      const override = overrides[toggleKey(item.id, date)]
      return override === undefined ? item : { ...item, done: override }
    })

  const yesterday = data ? shiftDay(data.date, -1) : ''

  return {
    status,
    date: data?.date,
    /** The latest recent miss (`yyyy-MM-dd`), to welcome the player back; null when none. */
    lastMissedOn: data?.lastMissedOn ?? null,
    yesterday,
    today: data ? withOverrides(data.today, data.date) : [],
    yesterdayPending: data ? withOverrides(data.yesterdayPending, yesterday) : [],
    avoiding: data?.avoiding ?? [],
    freeToday: data?.freeToday ?? [],
    isPending: (habitId: number, date: string) => pending.has(toggleKey(habitId, date)),
    toggle,
    setRelapse,
    reload,
  }
}

/** `yyyy-MM-dd` moved by `days`, computed in UTC so no time zone shifts it. */
function shiftDay(date: string, days: number) {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10)
}
