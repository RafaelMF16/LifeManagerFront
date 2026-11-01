import { getChallengeHistory, getChallengeWeek } from '../services/challengeService'
import type { ChallengeHistoryDto, ChallengeWeek, ChallengeWeekDto } from '../types/ChallengeDtos'
import { useKeyedFetch } from './useKeyedFetch'

export const CHALLENGE_HISTORY_PAGE_SIZE = 10

/** The week's challenges, suggestions and habits to pick (each read settles the challenges first). */
export function useChallengeWeek(week: ChallengeWeek) {
  return useKeyedFetch<ChallengeWeekDto>(`week-${week}`, (signal) => getChallengeWeek(week, signal))
}

/** The past weeks, newest first. */
export function useChallengeHistory(page: number) {
  return useKeyedFetch<ChallengeHistoryDto>(`history-${page}`, (signal) => getChallengeHistory(page, CHALLENGE_HISTORY_PAGE_SIZE, signal))
}
