import i18next from 'i18next'
import { beforeEach, describe, expect, it } from 'vitest'
import { registerNamespace } from './registerNamespace'

describe('registerNamespace', () => {
  let i18n: typeof i18next

  beforeEach(async () => {
    i18n = i18next.createInstance()
    await i18n.init({ resources: { 'en-US': { common: {} }, 'pt-BR': { common: {} } }, lng: 'pt-BR', ns: ['common'] })
  })

  it('adds the namespace in both languages', () => {
    registerNamespace(i18n, 'finance', { title: 'Finances' }, { title: 'Finanças' })

    expect(i18n.t('finance:title', { lng: 'en-US' })).toBe('Finances')
    expect(i18n.t('finance:title', { lng: 'pt-BR' })).toBe('Finanças')
  })

  it('reads zero as plural in pt-BR', () => {
    registerNamespace(i18n, 'habits', {}, { days_one: '{{count}} dia', days_other: '{{count}} dias' })

    expect(i18n.t('habits:days', { count: 0, lng: 'pt-BR' })).toBe('0 dias')
  })

  it('keeps the first registration when called again', () => {
    registerNamespace(i18n, 'finance', { title: 'Finances' }, { title: 'Finanças' })
    registerNamespace(i18n, 'finance', { title: 'Other' }, { title: 'Outro' })

    expect(i18n.t('finance:title', { lng: 'pt-BR' })).toBe('Finanças')
  })
})
