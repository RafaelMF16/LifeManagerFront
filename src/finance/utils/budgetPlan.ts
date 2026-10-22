import type { BudgetPlanRequestDto, BudgetPlanResponseDto, BudgetSliceType } from '../types/BudgetPlanDtos'

// The rules of the budget editor, mirroring LifeManager.Domain/BudgetPlans. Percents and money are added as whole
// hundredths and cents, so 33.33 × 3 is exactly 99.99 and rounding matches the backend's (half away from zero).

/** A slice as the editor holds it: the plan's shape plus the name to show, without the actual amounts. */
export interface DraftSlice {
  type: BudgetSliceType
  categoryId: number | null
  categoryName: string | null
  percent: number
}

export interface BudgetDraft {
  /** Null while the month has no total yet. */
  total: number | null
  slices: DraftSlice[]
}

const HUNDREDTHS = 100
const WHOLE = 100 * HUNDREDTHS

function toHundredths(percent: number) {
  return Math.round(percent * HUNDREDTHS)
}

function toCents(amount: number) {
  return Math.round(amount * 100)
}

function slicedHundredths(slices: DraftSlice[]) {
  return slices.reduce((sum, slice) => sum + toHundredths(slice.percent), 0)
}

/** Identifies a slice within a plan: its category, or the one investment slice. */
export function sliceKey(slice: Pick<DraftSlice, 'type' | 'categoryId'>) {
  return slice.type === 'Investment' ? 'investment' : `category-${slice.categoryId}`
}

/** What the slices leave of 100%. */
export function freePercent(slices: DraftSlice[]) {
  return (WHOLE - slicedHundredths(slices)) / HUNDREDTHS
}

/** How far a slice's slider may go: its own share plus whatever is still free. */
export function maxPercentFor(slices: DraftSlice[], index: number) {
  return (toHundredths(slices[index].percent) + WHOLE - slicedHundredths(slices)) / HUNDREDTHS
}

/** Sets one slice's percent, kept between 0 and its maximum and rounded to hundredths. */
export function setSlicePercent(slices: DraftSlice[], index: number, percent: number): DraftSlice[] {
  const clamped = Math.min(Math.max(toHundredths(percent), 0), toHundredths(maxPercentFor(slices, index)))

  return slices.map((slice, sliceIndex) => (sliceIndex === index ? { ...slice, percent: clamped / HUNDREDTHS } : slice))
}

/** The slice in money: total × percent, rounded to cents. Zero while there is no total. */
export function sliceAmount(total: number | null, percent: number) {
  if (total === null) return 0

  return Math.round((toCents(total) * toHundredths(percent)) / WHOLE) / 100
}

/** The free part in money: the total minus the slices' rounded amounts, so it closes with the total. */
export function freeAmount(total: number | null, slices: DraftSlice[]) {
  if (total === null) return null

  const slicedCents = slices.reduce((sum, slice) => sum + toCents(sliceAmount(total, slice.percent)), 0)
  return (toCents(total) - slicedCents) / 100
}

/** An amount of money as a share of the total, rounded to hundredths. Zero while there is no total. */
export function percentFromAmount(total: number | null, amount: number) {
  if (total === null || total <= 0) return 0

  return Math.round((toCents(amount) * WHOLE) / toCents(total)) / HUNDREDTHS
}

/** Adds a slice: expenses go before the investment slice, which always comes last. */
export function addSlice(slices: DraftSlice[], slice: DraftSlice): DraftSlice[] {
  const investmentIndex = slices.findIndex((existing) => existing.type === 'Investment')
  if (slice.type === 'Investment' || investmentIndex === -1) return [...slices, slice]

  return [...slices.slice(0, investmentIndex), slice, ...slices.slice(investmentIndex)]
}

export function removeSlice(slices: DraftSlice[], index: number): DraftSlice[] {
  return slices.filter((_, sliceIndex) => sliceIndex !== index)
}

/** The editable part of a month's plan, from the plan itself or from the month being copied. */
export function toDraft(plan: BudgetPlanResponseDto): BudgetDraft {
  if (!plan.exists) return { total: null, slices: [] }

  return {
    total: plan.total,
    slices: plan.slices.map(({ type, categoryId, categoryName, percent }) => ({ type, categoryId, categoryName, percent })),
  }
}

/** The body of the save; slices left at 0% are dropped. Only call it with a total. */
export function toRequest(draft: BudgetDraft): BudgetPlanRequestDto {
  return {
    total: draft.total ?? 0,
    slices: draft.slices
      .filter((slice) => toHundredths(slice.percent) > 0)
      .map(({ type, categoryId, percent }) => ({ type, categoryId, percent })),
  }
}

function signature(draft: BudgetDraft) {
  const slices = draft.slices
    .filter((slice) => toHundredths(slice.percent) > 0)
    .map((slice) => `${sliceKey(slice)}:${toHundredths(slice.percent)}`)
    .sort()

  return JSON.stringify([draft.total, slices])
}

/** Whether saving `draft` would change what is stored (`saved`). Order and slices at 0% don't count. */
export function isDraftDirty(draft: BudgetDraft, saved: BudgetDraft) {
  return signature(draft) !== signature(saved)
}
