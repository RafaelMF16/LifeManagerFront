import { apiRequest } from '../../shared/services/httpClient'
import type { HabitProgressResultDto } from '../types/HabitTodayDtos'

const HABITS_PATH = '/api/Habits'

/** `date` is `yyyy-MM-dd`: today or yesterday. Reaching the daily target checks the day in. */
export function addProgress(habitId: number, date: string, value: number): Promise<HabitProgressResultDto> {
  return apiRequest<HabitProgressResultDto>(`${HABITS_PATH}/${habitId}/Progress`, { method: 'POST', body: { date, value } })
}

/** Falling below the daily target undoes the day's check-in, giving back what it earned. */
export function removeProgress(habitId: number, entryId: number): Promise<HabitProgressResultDto> {
  return apiRequest<HabitProgressResultDto>(`${HABITS_PATH}/${habitId}/Progress/${entryId}`, { method: 'DELETE' })
}
