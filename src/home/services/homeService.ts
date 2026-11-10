import { apiRequest } from '../../shared/services/httpClient'
import type { HomeOverviewDto } from '../types/HomeOverview'

/** The Home's summary of the day (habits, player, current month and its budget), in one read. */
export function getHomeOverview(signal?: AbortSignal): Promise<HomeOverviewDto> {
  return apiRequest<HomeOverviewDto>('/api/Home/Overview', { method: 'GET', signal })
}
