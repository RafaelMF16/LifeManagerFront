import { useCallback, useEffect, useMemo, useState } from 'react'
import { deleteBudgetPlan, getBudgetPlan, saveBudgetPlan } from '../services/budgetPlanService'
import type { BudgetPlanResponseDto } from '../types/BudgetPlanDtos'
import {
  addSlice as addDraftSlice,
  isDraftDirty,
  removeSlice as removeDraftSlice,
  setSlicePercent,
  toDraft,
  toRequest,
} from '../utils/budgetPlan'
import type { BudgetDraft, DraftSlice } from '../utils/budgetPlan'

export type BudgetPlanStatus = 'loading' | 'ready' | 'error'

interface FetchResult {
  /** Which request this outcome belongs to, so a stale one is never shown as current. */
  key: string
  data?: BudgetPlanResponseDto
  failed?: boolean
}

interface Edit {
  /** The loaded result the edit was made on; a new load (another month, a save) leaves it behind. */
  key: string
  draft: BudgetDraft
}

/**
 * The plan of `month` (`yyyy-MM`) and the editor's draft of it. Nothing is saved until `save()`: the draft lives
 * here, starts as the stored plan and goes back to it on `discard()` or when another month loads.
 */
export function useBudgetPlan(month: string) {
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<FetchResult | null>(null)
  const [edit, setEdit] = useState<Edit | null>(null)

  const requestKey = JSON.stringify([month, reloadKey])

  useEffect(() => {
    // Aborted when the month changes or on unmount, which also fires the backend's CancellationToken.
    const controller = new AbortController()
    const key = JSON.stringify([month, reloadKey])

    getBudgetPlan(month, controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ key, data })
      },
      () => {
        if (!controller.signal.aborted) setResult((previous) => ({ key, data: previous?.data, failed: true }))
      },
    )

    return () => controller.abort()
  }, [month, reloadKey])

  // The previous month stays on screen while the next one loads, so the page doesn't flash.
  const data = result?.data
  const isFetching = result?.key !== requestKey
  const current = result?.key === requestKey ? result : null
  const status: BudgetPlanStatus = current?.failed ? 'error' : data ? 'ready' : 'loading'

  const loadedKey = current?.data ? current.key : null
  const saved = useMemo(() => (data ? toDraft(data) : null), [data])
  const editing = edit && edit.key === loadedKey ? edit.draft : null
  const draft = editing ?? saved

  /** Whether the editor is open: the month has a plan, or the user started one (empty or copied). */
  const isStarted = Boolean(data?.exists) || editing !== null
  const isDirty = editing !== null && saved !== null && isDraftDirty(editing, saved)

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  const change = useCallback(
    (update: (draft: BudgetDraft) => BudgetDraft) => {
      if (!loadedKey || !draft) return
      setEdit({ key: loadedKey, draft: update(draft) })
    },
    [loadedKey, draft],
  )

  const setTotal = useCallback((total: number | null) => change((previous) => ({ ...previous, total })), [change])

  const setPercent = useCallback(
    (index: number, percent: number) => change((previous) => ({ ...previous, slices: setSlicePercent(previous.slices, index, percent) })),
    [change],
  )

  const addSlice = useCallback(
    (slice: DraftSlice) => change((previous) => ({ ...previous, slices: addDraftSlice(previous.slices, slice) })),
    [change],
  )

  const removeSlice = useCallback(
    (index: number) => change((previous) => ({ ...previous, slices: removeDraftSlice(previous.slices, index) })),
    [change],
  )

  /** Opens the editor on a month without a plan, with nothing filled in. */
  const start = useCallback(() => change((previous) => previous), [change])

  /** Fills the draft with another month's plan, without saving. */
  const copyFrom = useCallback((source: BudgetPlanResponseDto) => change(() => toDraft(source)), [change])

  /** Reads `source` (`yyyy-MM`) and fills the draft with its plan, without saving. */
  const copyFromMonth = useCallback(
    async (source: string) => {
      copyFrom(await getBudgetPlan(source))
    },
    [copyFrom],
  )

  const discard = useCallback(() => setEdit(null), [])

  /** Saves the draft as the month's whole plan; the response becomes the loaded plan. Needs a total. */
  const save = useCallback(async () => {
    if (!draft) return

    const saved = await saveBudgetPlan(month, toRequest(draft))
    setResult({ key: requestKey, data: saved })
    setEdit(null)
  }, [draft, month, requestKey])

  const deletePlan = useCallback(async () => {
    await deleteBudgetPlan(month)
    setEdit(null)
    reload()
  }, [month, reload])

  return {
    data,
    status,
    isFetching,
    reload,
    draft,
    isStarted,
    isDirty,
    setTotal,
    setPercent,
    addSlice,
    removeSlice,
    start,
    copyFrom,
    copyFromMonth,
    discard,
    save,
    deletePlan,
  }
}
