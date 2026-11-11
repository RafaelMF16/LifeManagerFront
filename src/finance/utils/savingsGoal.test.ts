import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SAVINGS_GOAL_ICON,
  deadlineCountdown,
  monthlyNeededText,
  paceBadge,
  progressBarRatio,
  savingsChartBars,
  savingsGoalIcon,
  savingsGoalOptions,
} from './savingsGoal'

describe('savingsGoalIcon', () => {
  it('keeps a known icon', () => {
    expect(savingsGoalIcon('plane')).toBe('plane')
  })

  it.each([null, undefined, '', 'rocket-ship'])('falls back to the default for %j', (id) => {
    expect(savingsGoalIcon(id)).toBe(DEFAULT_SAVINGS_GOAL_ICON)
  })
})

describe('deadlineCountdown', () => {
  it('counts the months still to go, one less than the inclusive monthsLeft', () => {
    expect(deadlineCountdown({ monthsLeft: 14, pace: 'OnTrack' })).toEqual({
      key: 'finance:savingsGoals.deadline.monthsToGo',
      values: { count: 13 },
    })
  })

  it('says the deadline is this month when only the current month is left', () => {
    expect(deadlineCountdown({ monthsLeft: 1, pace: 'Behind' })).toEqual({ key: 'finance:savingsGoals.deadline.thisMonth' })
  })

  it.each([0, -3])('says the deadline passed when monthsLeft is %i', (monthsLeft) => {
    expect(deadlineCountdown({ monthsLeft, pace: 'Behind' })).toEqual({ key: 'finance:savingsGoals.deadline.passed' })
  })

  it('has nothing to count without a deadline or once done', () => {
    expect(deadlineCountdown({ monthsLeft: null, pace: 'NoDeadline' })).toBeNull()
    expect(deadlineCountdown({ monthsLeft: 5, pace: 'Done' })).toBeNull()
  })
})

describe('monthlyNeededText', () => {
  const goal = { monthsLeft: 14, monthlyNeeded: 192.86, remaining: 2700, pace: 'OnTrack' as const }

  it('asks for an amount per month while there are months ahead', () => {
    expect(monthlyNeededText(goal)).toEqual({ key: 'finance:savingsGoals.card.monthlyNeeded', amount: 192.86 })
  })

  it('asks for everything now in the deadline month or after it', () => {
    expect(monthlyNeededText({ ...goal, monthsLeft: 1, monthlyNeeded: 2700 })).toEqual({
      key: 'finance:savingsGoals.card.neededNow',
      amount: 2700,
    })
    expect(monthlyNeededText({ ...goal, monthsLeft: -2, monthlyNeeded: 2700 })?.key).toBe('finance:savingsGoals.card.neededNow')
  })

  it('is hidden without a deadline, once done or with nothing left', () => {
    expect(monthlyNeededText({ ...goal, monthsLeft: null, monthlyNeeded: null, pace: 'NoDeadline' })).toBeNull()
    expect(monthlyNeededText({ ...goal, pace: 'Done' })).toBeNull()
    expect(monthlyNeededText({ ...goal, remaining: 0 })).toBeNull()
  })
})

describe('paceBadge', () => {
  it.each([
    ['Done', 'success'],
    ['OnTrack', 'positive'],
    ['Behind', 'warning'],
  ] as const)('gives %s a word and the %s tone', (pace, tone) => {
    expect(paceBadge(pace)).toEqual({ tone, labelKey: `finance:savingsGoals.pace.${pace}` })
  })

  it('shows no badge without a deadline', () => {
    expect(paceBadge('NoDeadline')).toBeNull()
  })
})

describe('progressBarRatio', () => {
  it.each([
    [0, 0],
    [0.46, 0.46],
    [1, 1],
    [1.3, 1],
  ])('turns the ratio %s into a bar of %s', (ratio, expected) => {
    expect(progressBarRatio(ratio)).toBe(expected)
  })
})

describe('savingsChartBars', () => {
  it('scales the bars to a round top over the largest month', () => {
    const { scaleMax, bars } = savingsChartBars([
      { month: '2026-10', amount: 0 },
      { month: '2026-11', amount: 430 },
      { month: '2026-12', amount: 250 },
    ])

    expect(scaleMax).toBe(500)
    expect(bars.map((bar) => bar.ratio)).toEqual([0, 0.86, 0.5])
    expect(bars[1]).toMatchObject({ month: '2026-11', amount: 430 })
  })

  it('keeps a scale when nothing was saved and flattens negative months', () => {
    const { scaleMax, bars } = savingsChartBars([
      { month: '2026-11', amount: 0 },
      { month: '2026-12', amount: -50 },
    ])

    expect(scaleMax).toBe(1)
    expect(bars.map((bar) => bar.ratio)).toEqual([0, 0])
  })
})

describe('savingsGoalOptions', () => {
  const goals = [
    { id: 2, name: 'Viagem' },
    { id: 1, name: 'Reserva' },
  ]

  it('lists the goals by name', () => {
    expect(savingsGoalOptions(goals, null).map((option) => option.name)).toEqual(['Reserva', 'Viagem'])
  })

  it('keeps the current goal when it is no longer linkable, marked archived', () => {
    expect(savingsGoalOptions(goals, { id: 9, name: 'Carro' }).at(-1)).toEqual({ id: 9, name: 'Carro', archived: true })
  })

  it('does not repeat a current goal that is still listed', () => {
    expect(savingsGoalOptions(goals, { id: 2, name: 'Viagem' })).toHaveLength(2)
  })
})
