import { useCallback, useEffect, useRef, useState } from 'react'
import { checkIn, getToday, undoCheckIn } from '../services/habitCheckInService'
import { addProgress as addProgressRequest, removeProgress as removeProgressRequest } from '../services/habitProgressService'
import { relapse as relapseRequest, undoRelapse as undoRelapseRequest } from '../services/habitRelapseService'
import type {
  HabitAvoidItemDto,
  HabitCheckInResultDto,
  HabitProgressEntryDto,
  HabitProgressResultDto,
  HabitRelapseResultDto,
  HabitTodayDto,
  HabitTodayItemDto,
} from '../types/HabitTodayDtos'
import { withPendingProgress } from '../utils/habitProgress'
import type { DayProgress, PendingProgress } from '../utils/habitProgress'

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
 *
 * `addProgress`/`removeProgress` change a measured habit's day optimistically too, but every tap counts: they queue
 * per habit and day, each request starting once the previous one answered, and the item shows the last saved day
 * with the queued changes applied. A failed one just leaves the queue, which takes the bar back. The list reloads
 * once the queue is empty.
 */
export function useHabitsToday() {
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<FetchResult | null>(null)
  // Optimistic "done" values, kept until the list reloads with the saved state.
  const [overrides, setOverrides] = useState<Record<string, boolean>>({})
  const [pending, setPending] = useState<ReadonlySet<string>>(new Set())
  // Read synchronously by toggle, so a double tap is caught before React re-renders.
  const pendingRef = useRef(new Set<string>())
  // A measured day as the latest progress answer left it, kept until the list reloads with it.
  const [savedProgress, setSavedProgress] = useState<Record<string, DayProgress>>({})
  const [queuedProgress, setQueuedProgress] = useState<Record<string, PendingProgress[]>>({})
  // The tail of each day's queue, and the next id for a queued change.
  const progressQueuesRef = useRef(new Map<string, Promise<unknown>>())
  const nextProgressIdRef = useRef(1)
  // Entries whose removal is queued: a second tap on the same one is ignored, like a check-in's double tap.
  const removingEntriesRef = useRef(new Set<number>())

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
        setSavedProgress((current) =>
          Object.fromEntries(Object.entries(current).filter(([key]) => progressQueuesRef.current.has(key))),
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

  /** Runs `request` after the day's earlier progress requests, showing `change` until it answers. */
  const queueProgress = useCallback(
    (
      item: HabitTodayItemDto,
      date: string,
      change: PendingProgress,
      request: () => Promise<HabitProgressResultDto>,
    ): Promise<HabitProgressResultDto> => {
      const key = toggleKey(item.id, date)
      setQueuedProgress((current) => ({ ...current, [key]: [...(current[key] ?? []), change] }))

      const queues = progressQueuesRef.current
      const run = (queues.get(key) ?? Promise.resolve())
        .then(request)
        .then((saved) => {
          setSavedProgress((current) => ({
            ...current,
            [key]: { progress: saved.progress, done: saved.done, entries: saved.entries },
          }))
          return saved
        })
        .finally(() => {
          setQueuedProgress((current) => {
            const left = (current[key] ?? []).filter((queued) => queued.id !== change.id)
            const next = { ...current }
            if (left.length > 0) next[key] = left
            else delete next[key]
            return next
          })
        })

      // A failure belongs to its own caller; the next request in the queue still runs.
      const tail = run.catch(() => undefined)
      queues.set(key, tail)
      void tail.then(() => {
        if (queues.get(key) !== tail) return
        queues.delete(key)
        reload()
      })

      return run
    },
    [reload],
  )

  const addProgress = useCallback(
    (item: HabitTodayItemDto, date: string, value: number) =>
      queueProgress(item, date, { id: nextProgressIdRef.current++, kind: 'add', value }, () =>
        addProgressRequest(item.id, date, value),
      ),
    [queueProgress],
  )

  const removeProgress = useCallback(
    async (item: HabitTodayItemDto, date: string, entry: HabitProgressEntryDto): Promise<HabitProgressResultDto | undefined> => {
      const removing = removingEntriesRef.current
      if (removing.has(entry.id)) return undefined

      removing.add(entry.id)
      try {
        return await queueProgress(
          item,
          date,
          { id: nextProgressIdRef.current++, kind: 'remove', entryId: entry.id, value: entry.value },
          () => removeProgressRequest(item.id, entry.id),
        )
      } finally {
        removing.delete(entry.id)
      }
    },
    [queueProgress],
  )

  const data = result?.data
  const status: HabitsTodayStatus = data ? 'ready' : result?.failed ? 'error' : 'loading'

  const withOverrides = (items: HabitTodayItemDto[], date: string) =>
    items.map((item) => {
      const key = toggleKey(item.id, date)
      const override = overrides[key]
      const shown = override === undefined ? item : { ...item, done: override }
      if (!shown.target) return shown

      const saved = savedProgress[key] ?? { progress: shown.progress, done: shown.done, entries: shown.entries }
      return { ...shown, ...withPendingProgress(saved, queuedProgress[key] ?? [], shown.target.value) }
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
    addProgress,
    removeProgress,
    reload,
  }
}

/** `yyyy-MM-dd` moved by `days`, computed in UTC so no time zone shifts it. */
function shiftDay(date: string, days: number) {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10)
}
