import { apiRequest } from '../../shared/services/httpClient'
import type { PagedResponse } from '../../shared/types/Paging'
import type { HabitStatsDto } from '../types/HabitStatsDtos'
import type { GameLedgerEntryDto } from '../types/LedgerDtos'

export function getHabitStats(habitId: number, signal?: AbortSignal): Promise<HabitStatsDto> {
  return apiRequest<HabitStatsDto>(`/api/Habits/${habitId}/Stats`, { method: 'GET', signal })
}

/** The player's statement, newest first; only one habit's entries when `habitId` is given. */
export function getLedger(
  page: number,
  pageSize: number,
  habitId: number | undefined,
  signal?: AbortSignal,
): Promise<PagedResponse<GameLedgerEntryDto>> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  if (habitId !== undefined) params.set('habitId', String(habitId))

  return apiRequest<PagedResponse<GameLedgerEntryDto>>(`/api/Habits/Ledger?${params}`, { method: 'GET', signal })
}
