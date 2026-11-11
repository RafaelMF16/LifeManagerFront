import { withZeroPlurals } from './withZeroPlurals'

type Resource = { [key: string]: unknown }

/**
 * One namespace's texts in both languages, ready for i18next. pt-BR goes through `withZeroPlurals` because its plural
 * rule reads 0 as singular ("0 dia"); en-US already reads 0 as plural. Every namespace, eager or loaded with its
 * module, comes through here.
 */
export function namespaceBundles<T extends Resource, U extends Resource>(enUS: T, ptBR: U) {
  return { 'en-US': enUS, 'pt-BR': withZeroPlurals(ptBR) }
}
