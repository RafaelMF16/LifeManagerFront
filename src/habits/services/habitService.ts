import { apiRequest } from '../../shared/services/httpClient'
import type { PagedResponse } from '../../shared/types/Paging'
import type { HabitListQuery, HabitRequestDto, HabitResponseDto, HabitUpdateRequestDto } from '../types/HabitDtos'
import type { HabitFormValues } from '../validation/habitSchema'

const HABITS_PATH = '/api/Habits'

/**
 * Sends only what the frequency uses (the backend rejects days on a TimesPerWeek habit and vice versa); a habit to
 * avoid is always daily. Blank optional texts go as null.
 */
export function toUpdateRequestDto(values: HabitFormValues): HabitUpdateRequestDto {
  const frequencyType = values.kind === 'Negative' ? 'Daily' : values.frequencyType

  return {
    name: values.name,
    description: values.description === '' ? null : values.description,
    trigger: values.trigger === '' ? null : values.trigger,
    difficulty: values.difficulty,
    frequencyType,
    weekDays: frequencyType === 'WeekDays' ? values.weekDays : null,
    timesPerWeek: frequencyType === 'TimesPerWeek' ? Number(values.timesPerWeek) : null,
  }
}

export function toRequestDto(values: HabitFormValues): HabitRequestDto {
  return { ...toUpdateRequestDto(values), kind: values.kind }
}

export function getHabits(query: HabitListQuery, signal?: AbortSignal): Promise<PagedResponse<HabitResponseDto>> {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
    status: query.status,
    sortBy: query.sortBy,
    sortDirection: query.sortDirection,
  })
  if (query.search) params.set('search', query.search)

  return apiRequest<PagedResponse<HabitResponseDto>>(`${HABITS_PATH}?${params}`, { method: 'GET', signal })
}

export function createHabit(values: HabitFormValues): Promise<HabitResponseDto> {
  return apiRequest<HabitResponseDto>(HABITS_PATH, { method: 'POST', body: toRequestDto(values) })
}

/** The kind can't change, so it isn't sent. */
export function updateHabit(id: number, values: HabitFormValues): Promise<HabitResponseDto> {
  return apiRequest<HabitResponseDto>(`${HABITS_PATH}/${id}`, { method: 'PUT', body: toUpdateRequestDto(values) })
}

/** Archives the habit: its history stays and it can be restored. */
export async function archiveHabit(id: number): Promise<void> {
  await apiRequest<void>(`${HABITS_PATH}/${id}`, { method: 'DELETE' })
}

export function restoreHabit(id: number): Promise<HabitResponseDto> {
  return apiRequest<HabitResponseDto>(`${HABITS_PATH}/${id}/Restore`, { method: 'POST' })
}
