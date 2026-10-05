import { useCallback, useEffect, useState } from 'react'
import { getFinanceDashboard } from '../services/financeDashboardService'
import { getMonthlySummaryYears } from '../services/monthlySummaryService'
import type { DashboardPresetId, FinanceDashboardResponseDto } from '../types/DashboardDtos'
import {
  BASE_DASHBOARD_PRESETS,
  DEFAULT_DASHBOARD_PRESET,
  pastYearPresets,
  resolveDashboardPreset,
} from '../utils/dashboardPeriod'

export type FinanceDashboardStatus = 'loading' | 'ready' | 'error'

interface FetchResult {
  /** Which request this outcome belongs to, so a stale one is never shown as current. */
  key: string
  data?: FinanceDashboardResponseDto
  failed?: boolean
}

/** The dashboard of the chosen period. The preset is turned into months here, from the user's local date. */
export function useFinanceDashboard() {
  const [preset, setPreset] = useState<DashboardPresetId>(DEFAULT_DASHBOARD_PRESET)
  const [years, setYears] = useState<number[]>([])
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<FetchResult | null>(null)

  const { from, to, comparison } = resolveDashboardPreset(preset, new Date())
  const requestKey = JSON.stringify([from, to, comparison, reloadKey])

  useEffect(() => {
    // Aborted when the period changes or on unmount, which also fires the backend's CancellationToken.
    const controller = new AbortController()
    const key = JSON.stringify([from, to, comparison, reloadKey])

    getFinanceDashboard({ from, to, comparison }, controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ key, data })
      },
      () => {
        if (!controller.signal.aborted) setResult((previous) => ({ key, data: previous?.data, failed: true }))
      },
    )

    return () => controller.abort()
  }, [from, to, comparison, reloadKey])

  useEffect(() => {
    // Past years are a nice-to-have: if they fail to load, the fixed presets still work.
    const controller = new AbortController()

    getMonthlySummaryYears(controller.signal).then(
      (loaded) => {
        if (!controller.signal.aborted) setYears(loaded)
      },
      () => undefined,
    )

    return () => controller.abort()
  }, [])

  // The previous period stays on screen while the next one loads, so the page doesn't flash.
  const data = result?.data
  const isFetching = result?.key !== requestKey
  const current = result?.key === requestKey ? result : null
  const status: FinanceDashboardStatus = current?.failed ? 'error' : data ? 'ready' : 'loading'

  const presets = [...BASE_DASHBOARD_PRESETS, ...pastYearPresets(years, new Date())]
  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  return { data, status, isFetching, reload, preset, setPreset, presets }
}
