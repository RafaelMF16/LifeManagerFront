type Resource = { [key: string]: unknown }

const ONE_SUFFIX = '_one'

/**
 * Gives every `_one`/`_other` pair a `_zero` with the `_other` text, unless the pair already has its own `_zero`.
 *
 * pt-BR's plural rule (CLDR) puts 0 in the `one` category, so without this `t('days', { count: 0 })` reads
 * "0 dia" instead of "0 dias". i18next tries `_zero` first whenever count is 0, in every language, so filling it
 * fixes 0 without touching 1 or 2. Returns a new object; the input is never mutated.
 */
export function withZeroPlurals<T extends Resource>(resource: T): T {
  const result: Resource = {}

  for (const [key, value] of Object.entries(resource)) {
    result[key] = isResource(value) ? withZeroPlurals(value) : value
  }

  for (const key of Object.keys(resource)) {
    if (!key.endsWith(ONE_SUFFIX)) continue

    const base = key.slice(0, -ONE_SUFFIX.length)
    const other = resource[`${base}_other`]
    if (other !== undefined && !(`${base}_zero` in resource)) {
      result[`${base}_zero`] = other
    }
  }

  return result as T
}

function isResource(value: unknown): value is Resource {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
