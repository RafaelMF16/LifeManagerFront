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

/**
 * Actual / slice (1 = exactly the slice), to 4 places, against the unrounded share like the backend; null while
 * there is no total or the slice is at 0%. Lets a status follow the slider before saving.
 */
export function sliceRatio(actual: number, total: number | null, percent: number) {
  if (total === null || toHundredths(percent) <= 0) return null

  return Math.round((actual / ((total * percent) / 100)) * 10000) / 10000
}

/**
 * The color slot (0-based) of each key, so a color follows its category rather than its place in the list: keys
 * keep the slot they had and a new one takes the lowest free slot. Past `slotCount` a key gets -1 (the shared
 * "extra" color) until a slot frees up.
 */
export function assignColorSlots(keys: string[], previous: Record<string, number>, slotCount: number) {
  const slots: Record<string, number> = {}
  const taken = new Set<number>()

  for (const key of keys) {
    const slot = previous[key]
    if (slot !== undefined && slot >= 0 && slot < slotCount) {
      slots[key] = slot
      taken.add(slot)
    }
  }

  for (const key of keys) {
    if (key in slots) continue

    let slot = 0
    while (taken.has(slot)) slot++
    slots[key] = slot < slotCount ? slot : -1
    if (slot < slotCount) taken.add(slot)
  }

  return slots
}

function normalize(text: string) {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase().trim()
}

/**
 * What can still be added to the plan: the investment slice while there is none, and the categories without a
 * slice, filtered by `search` (ignoring accents and case; `investmentLabel` is what the search matches it by).
 */
export function sliceOptions<TCategory extends { id: number; name: string }>(
  categories: TCategory[],
  slices: DraftSlice[],
  search: string,
  investmentLabel = '',
) {
  const term = normalize(search)
  const sliced = new Set(slices.map(sliceKey))
  const matches = (name: string) => term === '' || normalize(name).includes(term)

  return {
    investment: !sliced.has('investment') && matches(investmentLabel),
    categories: categories.filter((category) => !sliced.has(`category-${category.id}`) && matches(category.name)),
  }
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
