import { apiRequest } from '../../shared/services/httpClient'
import type { HabitCheckInResultDto, HabitTodayDto } from '../types/HabitTodayDtos'

const HABITS_PATH = '/api/Habits'

export function getToday(signal?: AbortSignal): Promise<HabitTodayDto> {
  return apiRequest<HabitTodayDto>(`${HABITS_PATH}/Today`, { method: 'GET', signal })
}

/** `date` is `yyyy-MM-dd`: today or yesterday. */
export function checkIn(habitId: number, date: string): Promise<HabitCheckInResultDto> {
  return apiRequest<HabitCheckInResultDto>(`${HABITS_PATH}/${habitId}/CheckIns`, { method: 'POST', body: { date } })
}

/** Gives back exactly what the check-in earned. */
export function undoCheckIn(habitId: number, date: string): Promise<HabitCheckInResultDto> {
  return apiRequest<HabitCheckInResultDto>(`${HABITS_PATH}/${habitId}/CheckIns/${date}`, { method: 'DELETE' })
}
