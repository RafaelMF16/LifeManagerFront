import { describe, expect, it } from 'vitest'
import { createMoneyFormat } from './money'

// Intl puts a no-break space between "R$" and the digits.
const normalize = (text: string) => text.replace(/ /g, ' ')

describe('createMoneyFormat', () => {
  it('formats unsigned BRL in the given language', () => {
    expect(normalize(createMoneyFormat('pt-BR', false).money(-1234.5))).toBe('R$ 1.234,50')
    expect(createMoneyFormat('en-US', false).money(1234.5)).toBe('R$1,234.50')
  })

  it('signs negatives with a true minus sign', () => {
    const format = createMoneyFormat('pt-BR', false)

    expect(normalize(format.signedMoney(-50))).toBe('−R$ 50,00')
    expect(normalize(format.signedMoney(50))).toBe('R$ 50,00')
  })

  it('masks every amount, signed or not, keeping only the layout', () => {
    const portuguese = createMoneyFormat('pt-BR', true)
    const english = createMoneyFormat('en-US', true)

    expect(normalize(portuguese.money(1234.5))).toBe('R$ ••••••')
    expect(normalize(portuguese.signedMoney(-1234.5))).toBe('R$ ••••••')
    expect(english.money(9)).toBe('R$••••••')
  })

  it('formats a 0–1 ratio as a percentage, masked in privacy mode', () => {
    expect(createMoneyFormat('pt-BR', false).percent(0.923)).toBe('92,3%')
    expect(createMoneyFormat('en-US', false).percent(1.5)).toBe('150%')
    expect(createMoneyFormat('pt-BR', true).percent(0.923)).toBe('••%')
  })
})
