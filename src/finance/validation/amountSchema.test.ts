import { describe, expect, it } from 'vitest'
import { amountField, parseAmount, toFormAmount } from './amountSchema'

describe('parseAmount', () => {
  it.each([
    ['1234,56', 1234.56],
    ['1.234,56', 1234.56],
    ['1234.56', 1234.56],
    [' 10 ', 10],
    ['0,5', 0.5],
  ])('reads %s as %d', (input, expected) => {
    expect(parseAmount(input)).toBe(expected)
  })

  it.each(['', 'abc', '1,2,3', '-5', '12a'])('rejects %j', (input) => {
    expect(parseAmount(input)).toBeNull()
  })
})

describe('amountField', () => {
  const field = amountField('test:amount')

  it.each([
    ['', 'test:amount.required'],
    ['abc', 'test:amount.invalid'],
    ['0', 'test:amount.notPositive'],
    ['10,555', 'test:amount.tooManyDecimals'],
    ['1000000000000', 'test:amount.tooLarge'],
  ])('rejects %j with %s', (value, message) => {
    const result = field.safeParse(value)
    expect(result.success).toBe(false)
    expect(result.error?.issues.map((issue) => issue.message)).toEqual([message])
  })

  it('accepts a valid amount', () => {
    expect(field.safeParse(' 1.234,56 ').success).toBe(true)
  })
})

describe('toFormAmount', () => {
  it('shows two decimals without grouping, in the UI language', () => {
    expect(toFormAmount(1234.5, 'pt-BR')).toBe('1234,50')
    expect(toFormAmount(1234.5, 'en-US')).toBe('1234.50')
  })
})
