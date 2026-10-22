import { describe, expect, it } from 'vitest'
import type { BudgetPlanResponseDto } from '../types/BudgetPlanDtos'
import {
  addSlice,
  assignColorSlots,
  sliceOptions,
  sliceRatio,
  freeAmount,
  freePercent,
  isDraftDirty,
  maxPercentFor,
  percentFromAmount,
  removeSlice,
  setSlicePercent,
  sliceAmount,
  sliceKey,
  toDraft,
  toRequest,
} from './budgetPlan'
import type { DraftSlice } from './budgetPlan'

function expense(categoryId: number, percent: number, categoryName = `Category ${categoryId}`): DraftSlice {
  return { type: 'Expense', categoryId, categoryName, percent }
}

function investment(percent: number): DraftSlice {
  return { type: 'Investment', categoryId: null, categoryName: null, percent }
}

const savedPlan: BudgetPlanResponseDto = {
  month: '2026-10',
  exists: true,
  total: 6000,
  slices: [
    { type: 'Expense', categoryId: 4, categoryName: 'Mercado', percent: 25, amount: 1500, actual: 1250, ratio: 0.8333, achieved: true },
    { type: 'Expense', categoryId: 2, categoryName: 'Moradia', percent: 30, amount: 1800, actual: 0, ratio: 0, achieved: true },
    { type: 'Investment', categoryId: null, categoryName: null, percent: 20, amount: 1200, actual: 0, ratio: 0, achieved: false },
  ],
  freePercent: 25,
  freeAmount: 1500,
  freeActual: 300,
  copySource: '2026-09',
}

describe('freePercent', () => {
  it('is what the slices leave of 100%', () => {
    expect(freePercent([expense(1, 30), expense(2, 25), investment(20)])).toBe(25)
  })

  it('adds hundredths without floating-point drift', () => {
    expect(freePercent([expense(1, 33.33), expense(2, 33.33), expense(3, 33.33)])).toBe(0.01)
    expect(freePercent([expense(1, 0.1), expense(2, 0.2)])).toBe(99.7)
  })

  it('is 100 without slices', () => {
    expect(freePercent([])).toBe(100)
  })
})

describe('maxPercentFor', () => {
  it("is the slice's own share plus what is free", () => {
    expect(maxPercentFor([expense(1, 25), expense(2, 50), investment(20)], 0)).toBe(30)
  })

  it("is the slice's own share when nothing is free", () => {
    expect(maxPercentFor([expense(1, 25), expense(2, 75)], 0)).toBe(25)
  })
})

describe('setSlicePercent', () => {
  it('changes only that slice', () => {
    const slices = [expense(1, 25), expense(2, 50)]

    expect(setSlicePercent(slices, 1, 60)).toEqual([expense(1, 25), expense(2, 60)])
    expect(slices[1].percent).toBe(50)
  })

  it('stops at the maximum', () => {
    expect(setSlicePercent([expense(1, 25), expense(2, 70)], 0, 50)[0].percent).toBe(30)
  })

  it('stops at zero and rounds to hundredths', () => {
    expect(setSlicePercent([expense(1, 25)], 0, -5)[0].percent).toBe(0)
    expect(setSlicePercent([expense(1, 25)], 0, 12.345)[0].percent).toBe(12.35)
  })
})

describe('sliceAmount', () => {
  it.each([
    [6000, 25, 1500],
    [8000, 30, 2400],
    [100, 33.33, 33.33],
    [10.05, 50, 5.03],
    [1, 0.01, 0],
  ])('is %d × %d% rounded to cents like the backend', (total, percent, expected) => {
    expect(sliceAmount(total, percent)).toBe(expected)
  })

  it('is zero without a total', () => {
    expect(sliceAmount(null, 25)).toBe(0)
  })
})

describe('freeAmount', () => {
  it('closes with the total whatever the rounding', () => {
    const slices = [expense(1, 33.33), expense(2, 33.33), expense(3, 33.33)]

    expect(freeAmount(100, slices)).toBe(0.01)
  })

  it('follows the total, keeping the percents', () => {
    const slices = [expense(1, 30), expense(2, 25), investment(20)]

    expect(freeAmount(6000, slices)).toBe(1500)
    expect(freeAmount(8000, slices)).toBe(2000)
  })

  it('is null without a total', () => {
    expect(freeAmount(null, [])).toBeNull()
  })
})

describe('percentFromAmount', () => {
  it('turns money into a share of the total, rounded to hundredths', () => {
    expect(percentFromAmount(6000, 1500)).toBe(25)
    expect(percentFromAmount(6000, 1000)).toBe(16.67)
  })

  it('is zero without a total', () => {
    expect(percentFromAmount(null, 1500)).toBe(0)
  })
})

describe('addSlice and removeSlice', () => {
  it('puts a new expense before the investment slice', () => {
    expect(addSlice([expense(1, 25), investment(20)], expense(2, 0))).toEqual([expense(1, 25), expense(2, 0), investment(20)])
  })

  it('puts the investment slice last', () => {
    expect(addSlice([expense(1, 25)], investment(0))).toEqual([expense(1, 25), investment(0)])
  })

  it('removes one slice, freeing its share', () => {
    const slices = removeSlice([expense(1, 25), expense(2, 30)], 0)

    expect(slices).toEqual([expense(2, 30)])
    expect(freePercent(slices)).toBe(70)
  })
})

describe('sliceKey', () => {
  it('tells slices apart by category, with one investment key', () => {
    expect(sliceKey(expense(3, 10))).toBe('category-3')
    expect(sliceKey(investment(10))).toBe('investment')
  })
})

describe('toDraft', () => {
  it("keeps the plan's total and slices, without the actual amounts", () => {
    expect(toDraft(savedPlan)).toEqual({
      total: 6000,
      slices: [expense(4, 25, 'Mercado'), expense(2, 30, 'Moradia'), investment(20)],
    })
  })

  it('is an empty draft for a month without a plan', () => {
    expect(toDraft({ ...savedPlan, exists: false, total: null, slices: [] })).toEqual({ total: null, slices: [] })
  })
})

describe('toRequest', () => {
  it('sends the total and the slices, leaving out those at 0%', () => {
    expect(toRequest({ total: 6000, slices: [expense(4, 25), expense(2, 0), investment(20)] })).toEqual({
      total: 6000,
      slices: [
        { type: 'Expense', categoryId: 4, percent: 25 },
        { type: 'Investment', categoryId: null, percent: 20 },
      ],
    })
  })
})

describe('sliceRatio', () => {
  it('is the actual over the unrounded slice, to 4 places', () => {
    expect(sliceRatio(1250, 6000, 25)).toBe(0.8333)
  })

  it('follows a new percent before saving', () => {
    expect(sliceRatio(1250, 6000, 20)).toBe(1.0417)
  })

  it('is null without a total or a share', () => {
    expect(sliceRatio(100, null, 25)).toBeNull()
    expect(sliceRatio(100, 6000, 0)).toBeNull()
  })
})

describe('assignColorSlots', () => {
  it('gives each key the next slot in order', () => {
    expect(assignColorSlots(['a', 'b', 'c'], {}, 6)).toEqual({ a: 0, b: 1, c: 2 })
  })

  it('keeps the slot a key already had, so removing one repaints nothing', () => {
    expect(assignColorSlots(['a', 'c'], { a: 0, b: 1, c: 2 }, 6)).toEqual({ a: 0, c: 2 })
  })

  it('gives a new key the lowest free slot', () => {
    expect(assignColorSlots(['a', 'c', 'd'], { a: 0, c: 2 }, 6)).toEqual({ a: 0, c: 2, d: 1 })
  })

  it('marks keys past the last slot with -1', () => {
    expect(assignColorSlots(['a', 'b', 'c'], {}, 2)).toEqual({ a: 0, b: 1, c: -1 })
  })

  it('lets a key past the last slot take one that freed up', () => {
    expect(assignColorSlots(['b', 'c'], { a: 0, b: 1, c: -1 }, 2)).toEqual({ b: 1, c: 0 })
  })
})

describe('sliceOptions', () => {
  const categories = [
    { id: 1, name: 'Mercado' },
    { id: 2, name: 'Farmácia' },
    { id: 3, name: 'Lazer' },
  ]

  it('offers investments first and the categories without a slice', () => {
    expect(sliceOptions(categories, [expense(1, 25)], '')).toEqual({
      investment: true,
      categories: [
        { id: 2, name: 'Farmácia' },
        { id: 3, name: 'Lazer' },
      ],
    })
  })

  it('stops offering investments once the plan has that slice', () => {
    expect(sliceOptions(categories, [investment(20)], '').investment).toBe(false)
  })

  it('searches ignoring accents and case', () => {
    expect(sliceOptions(categories, [], 'FARMA').categories).toEqual([{ id: 2, name: 'Farmácia' }])
  })

  it('matches investments by its own label when searching', () => {
    expect(sliceOptions(categories, [], 'inves', 'Investimentos').investment).toBe(true)
    expect(sliceOptions(categories, [], 'merc', 'Investimentos').investment).toBe(false)
  })
})

describe('isDraftDirty', () => {
  const saved = toDraft(savedPlan)

  it('is clean when nothing changed', () => {
    expect(isDraftDirty(saved, saved)).toBe(false)
  })

  it('is dirty when the total or a percent changed', () => {
    expect(isDraftDirty({ ...saved, total: 7000 }, saved)).toBe(true)
    expect(isDraftDirty({ ...saved, slices: setSlicePercent(saved.slices, 0, 26) }, saved)).toBe(true)
  })

  it('is dirty when a slice was removed', () => {
    expect(isDraftDirty({ ...saved, slices: removeSlice(saved.slices, 1) }, saved)).toBe(true)
  })

  it('ignores a slice still at 0%, which saving would leave out', () => {
    expect(isDraftDirty({ ...saved, slices: addSlice(saved.slices, expense(9, 0)) }, saved)).toBe(false)
  })

  it('is dirty for a filled draft of a month without a plan', () => {
    expect(isDraftDirty({ total: 6000, slices: [] }, { total: null, slices: [] })).toBe(true)
  })
})
