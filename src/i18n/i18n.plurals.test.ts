import i18next from 'i18next'
import { beforeAll, describe, expect, it } from 'vitest'
import financeEnUS from '../finance/locales/en-US'
import financePtBR from '../finance/locales/pt-BR'
import habitsEnUS from '../habits/locales/en-US'
import habitsPtBR from '../habits/locales/pt-BR'
import { namespaceBundles } from './namespaceBundles'
import { EAGER_NAMESPACES, resources as eagerResources } from './resources'

type Resource = { [key: string]: unknown }

// Every namespace as the app gets it: the eager ones from `resources`, the module ones through `namespaceBundles`.
const finance = namespaceBundles(financeEnUS, financePtBR)
const habits = namespaceBundles(habitsEnUS, habitsPtBR)
const NAMESPACES = [...EAGER_NAMESPACES, 'finance', 'habits'] as const
const resources = {
  'en-US': { ...eagerResources['en-US'], finance: finance['en-US'], habits: habits['en-US'] },
  'pt-BR': { ...eagerResources['pt-BR'], finance: finance['pt-BR'], habits: habits['pt-BR'] },
}

/** Every `_one` key whose text differs from its `_other`, as the path `t()` takes (`summary.days`). */
function pluralKeys(resource: Resource, prefix = ''): string[] {
  return Object.entries(resource).flatMap(([key, value]) => {
    if (typeof value === 'object' && value !== null) return pluralKeys(value as Resource, `${prefix}${key}.`)
    if (!key.endsWith('_one')) return []
    const base = key.slice(0, -'_one'.length)
    return value !== resource[`${base}_other`] ? [`${prefix}${base}`] : []
  })
}

describe('pt-BR plurals', () => {
  const i18n = i18next.createInstance()

  beforeAll(async () => {
    await i18n.init({ resources, lng: 'pt-BR', ns: [...NAMESPACES], interpolation: { escapeValue: false } })
  })

  for (const namespace of NAMESPACES) {
    const keys = pluralKeys(resources['pt-BR'][namespace] as Resource)

    it.each(keys)(`${namespace}:%s with count 0 reads as plural`, (key) => {
      // What the bug showed: the singular text with 0 in it ("0 dia").
      const singularAtZero = i18n.t(`${namespace}:${key}_one`, { count: 0, lng: 'pt-BR' })
      const zero = i18n.t(`${namespace}:${key}`, { count: 0, lng: 'pt-BR' })

      expect(zero).not.toBe(singularAtZero)
    })
  }

  it('keeps the singular for 1 and the plural for 2', () => {
    expect(i18n.t('finance:imports.review.summary.included', { count: 1, lng: 'pt-BR' })).toBe('1 para importar')
    expect(i18n.t('finance:imports.review.summary.duplicates', { count: 2, lng: 'pt-BR' })).toBe('2 possíveis duplicatas')
  })

  it('keeps the _zero texts that already existed', () => {
    expect(i18n.t('finance:imports.review.summary.duplicates', { count: 0, lng: 'pt-BR' })).toBe('Nenhuma duplicata')
  })
})
