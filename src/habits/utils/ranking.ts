import type { GroupRankingDto, RankingEntryDto, RankingReactionKind, RankingReactionsDto, RankingWeekStatus } from '../types/RankingDtos'

// Espelha LifeManager.Domain/RankingGroups/ValueObjects/InviteCode (alphabet without look-alikes: no I, L, O, 0, 1).
export const INVITE_CODE_LENGTH = 8
const INVITE_CODE_PATTERN = /^[ABCDEFGHJKMNPQRSTUVWXYZ2-9]{8}$/

/**
 * The code in what the user typed or pasted: a bare code ("abcd efgh") or a whole invite link. Null when it can't be
 * one, so the form refuses it before asking the backend.
 */
export function parseInviteCode(input: string): string | null {
  const fromLink = /\/invite\/([^/?#\s]+)/i.exec(input)
  const candidate = (fromLink ? fromLink[1] : input).replace(/[\s-]/g, '').toUpperCase()
  return INVITE_CODE_PATTERN.test(candidate) ? candidate : null
}

/** The link to share: opening it signs in if needed and offers the group. */
export const inviteLink = (code: string, origin: string) => `${origin}/invite/${code}`

/** `yyyy-MM-dd` → a UTC date, so the day never shifts with the browser's time zone. */
const toUtcDate = (date: string) => new Date(`${date}T00:00:00Z`)

function addDays(date: string, days: number) {
  const moved = toUtcDate(date)
  moved.setUTCDate(moved.getUTCDate() + days)
  return moved.toISOString().slice(0, 10)
}

/** The Monday `weeks` weeks away from `weekStart` (`yyyy-MM-dd`). */
export const addWeeks = (weekStart: string, weeks: number) => addDays(weekStart, weeks * 7)

/** The week's Sunday. */
export const weekEndOf = (weekStart: string) => addDays(weekStart, 6)

/** "2 – 8 Nov", in `locale`. */
export function formatWeekRange(weekStart: string, weekEnd: string, locale: string) {
  const format = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', timeZone: 'UTC' })
  return format.formatRange(toUtcDate(weekStart), toUtcDate(weekEnd))
}

/** "Mon", in `locale`, for the day columns of my week. */
export function formatWeekday(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' }).format(toUtcDate(date))
}

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

/** 🥇🥈🥉 for the podium, nothing past it. */
export const medal = (position: number) => MEDALS[position] ?? null

/** The badge of the week: live, still settling, or stored for good. */
export const WEEK_STATUS_TONE: Record<RankingWeekStatus, 'live' | 'closing' | 'final'> = {
  Open: 'live',
  Closing: 'closing',
  Final: 'final',
}

/**
 * The reactions a member shows once the user's reaction becomes `next` (null = removed): the optimistic update before
 * the backend answers. Picking the reaction already there is the caller's "undo".
 */
export function withMyReaction(reactions: RankingReactionsDto, next: RankingReactionKind | null): RankingReactionsDto {
  const counts = { Clap: reactions.clap, Fire: reactions.fire }
  if (reactions.mine) counts[reactions.mine] = Math.max(counts[reactions.mine] - 1, 0)
  if (next) counts[next] += 1
  return { clap: counts.Clap, fire: counts.Fire, mine: next }
}

/** Total reactions a line got. */
export const reactionCount = (reactions: RankingReactionsDto) => reactions.clap + reactions.fire

/** The Monday of `today`'s week (local date), the same Monday-to-Sunday week as the backend. */
export function currentWeekStart(today: Date = new Date()) {
  const date = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()))
  const sinceMonday = (date.getUTCDay() + 6) % 7
  date.setUTCDate(date.getUTCDate() - sinceMonday)
  return date.toISOString().slice(0, 10)
}

/** Reactions are open on the current week and the one before; the backend has the last word. */
export const canReactTo = (weekStart: string, today: Date = new Date()) => {
  const current = currentWeekStart(today)
  return weekStart === current || weekStart === addWeeks(current, -1)
}

/** The ranking with one member's reactions in `weekStart` replaced, in the board and in last week's podium. */
export function patchReactions(ranking: GroupRankingDto, weekStart: string, memberId: number, reactions: RankingReactionsDto): GroupRankingDto {
  const patch = (entries: RankingEntryDto[]) =>
    entries.map((entry) => (entry.memberId === memberId ? { ...entry, reactions } : entry))

  return {
    ...ranking,
    entries: ranking.weekStart === weekStart ? patch(ranking.entries) : ranking.entries,
    previous:
      ranking.previous && ranking.previous.weekStart === weekStart
        ? { ...ranking.previous, podium: patch(ranking.previous.podium) }
        : ranking.previous,
  }
}
