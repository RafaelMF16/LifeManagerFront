import { apiRequest } from '../../shared/services/httpClient'
import type { HabitRelapseResultDto } from '../types/HabitTodayDtos'

const HABITS_PATH = '/api/Habits'

/** `date` is `yyyy-MM-dd`: today or yesterday. Costs HP (within a weekly limit, only past it) and breaks the streak. */
export function relapse(habitId: number, date: string): Promise<HabitRelapseResultDto> {
  return apiRequest<HabitRelapseResultDto>(`${HABITS_PATH}/${habitId}/Relapses`, { method: 'POST', body: { date } })
}

/** Gives back the HP the relapse cost. */
export function undoRelapse(habitId: number, date: string): Promise<HabitRelapseResultDto> {
  return apiRequest<HabitRelapseResultDto>(`${HABITS_PATH}/${habitId}/Relapses/${date}`, { method: 'DELETE' })
}
