import { describe, expect, it } from 'vitest'
import { detectDecimalSeparator, parseStatementAmount } from './statementAmount'

describe('parseStatementAmount', () => {
  it('reads signed amounts in both conventions', () => {
    expect(parseStatementAmount('-42,90')).toBe(-42.9)
    expect(parseStatementAmount('-42.90')).toBe(-42.9)
    expect(parseStatementAmount('+5000')).toBe(5000)
    expect(parseStatementAmount('1.234,56')).toBe(1234.56)
    expect(parseStatementAmount('1,234.56')).toBe(1234.56)
    expect(parseStatementAmount('1.234.567')).toBe(1234567)
  })

  it('reads the negative forms banks use', () => {
    expect(parseStatementAmount('(42,90)')).toBe(-42.9)
    expect(parseStatementAmount('42,90-')).toBe(-42.9)
    expect(parseStatementAmount('−42,90')).toBe(-42.9)
    expect(parseStatementAmount('R$ -1.000,00')).toBe(-1000)
    expect(parseStatementAmount('-R$ 1.000,00')).toBe(-1000)
  })

  it('uses the given decimal separator', () => {
    expect(parseStatementAmount('1.234', ',')).toBe(1234)
    expect(parseStatementAmount('1,234', '.')).toBe(1234)
    expect(parseStatementAmount('12,5', ',')).toBe(12.5)
  })

  it('rejects what is not a number', () => {
    expect(parseStatementAmount('')).toBeNull()
    expect(parseStatementAmount('abc')).toBeNull()
    expect(parseStatementAmount('12/03/2024')).toBeNull()
    expect(parseStatementAmount('-')).toBeNull()
    expect(parseStatementAmount('1,2,3', ',')).toBeNull()
  })

  it('never returns negative zero', () => {
    expect(Object.is(parseStatementAmount('-0,00'), 0)).toBe(true)
  })
})

describe('detectDecimalSeparator', () => {
  it('follows what most values use', () => {
    expect(detectDecimalSeparator(['-42,90', '1.000,00', '5'])).toBe(',')
    expect(detectDecimalSeparator(['-42.90', '1000.5', '7,00'])).toBe('.')
  })

  it('falls back to the comma', () => {
    expect(detectDecimalSeparator(['10', '20'])).toBe(',')
    expect(detectDecimalSeparator([])).toBe(',')
  })
})
