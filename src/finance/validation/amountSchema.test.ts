import { describe, expect, it } from 'vitest'
import { amountField, formatAmountInput, parseAmount, toFormAmount } from './amountSchema'

describe('parseAmount', () => {
  it.each([
    ['1234,56', 1234.56],
    ['1.234,56', 1234.56],
    ['1234.56', 1234.56],
    [' 10 ', 10],
    ['0,5', 0.5],
    ['1,234.56', 1234.56],
    ['12,345,678.90', 12345678.9],
    ['12.345.678,90', 12345678.9],
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

  it.each([' 1.234,56 ', '12,345.67'])('accepts %j', (value) => {
    expect(field.safeParse(value).success).toBe(true)
  })

  it('counts the decimals after the last separator', () => {
    expect(field.safeParse('1,234.567').error?.issues[0].message).toBe('test:amount.tooManyDecimals')
  })
})

describe('toFormAmount', () => {
  it('shows two decimals with grouping, in the UI language', () => {
    expect(toFormAmount(1234.5, 'pt-BR')).toBe('1.234,50')
    expect(toFormAmount(1234.5, 'en-US')).toBe('1,234.50')
  })

  it.each(['pt-BR', 'en-US'])('reads back as the same amount in %s', (language) => {
    expect(parseAmount(toFormAmount(1234567.8, language))).toBe(1234567.8)
  })
})

describe('formatAmountInput', () => {
  it.each([
    ['', ''],
    ['abc', ''],
    ['5', '0,05'],
    ['50', '0,50'],
    ['500', '5,00'],
    ['0', ''],
    ['005', '0,05'],
    ['0,050', '0,50'],
    ['1234567', '12.345,67'],
    ['R$ 50', '0,50'],
    ['1.234,56', '1.234,56'],
    ['99999999999999', '999.999.999.999,99'],
    ['999999999999999', '999.999.999.999,99'],
  ])('fills %j as %j in pt-BR', (input, expected) => {
    expect(formatAmountInput(input, 'pt-BR')).toBe(expected)
  })

  it('groups in the UI language', () => {
    expect(formatAmountInput('1234567', 'en-US')).toBe('12,345.67')
  })

  it('takes a digit typed after the cents in from the right', () => {
    expect(formatAmountInput('1.234,567', 'pt-BR')).toBe('12.345,67')
  })

  it('drops the last digit when the last character is erased', () => {
    expect(formatAmountInput('12.345,6', 'pt-BR')).toBe('1.234,56')
    // Erasing the last cent empties the field, so the placeholder comes back.
    expect(formatAmountInput('0,0', 'pt-BR')).toBe('')
  })

  it('reads back as the amount shown', () => {
    expect(parseAmount(formatAmountInput('1234567', 'en-US'))).toBe(12345.67)
    expect(parseAmount(formatAmountInput('1234567', 'pt-BR'))).toBe(12345.67)
  })
})
