import type { i18n as I18n } from 'i18next'
import { namespaceBundles } from './namespaceBundles'

type Resource = { [key: string]: unknown }

/**
 * Adds a module's namespace to `i18n`, in both languages, when the module's chunk loads. Called by the module's locale
 * entry (`finance/locales/register.ts`, `habits/locales/register.ts`), which its layout imports first: the router
 * evaluates the route modules before rendering them, so the texts are there by the first render. A second call for
 * the same namespace does nothing.
 */
export function registerNamespace(i18n: I18n, namespace: string, enUS: Resource, ptBR: Resource) {
  if (i18n.hasResourceBundle('en-US', namespace)) return

  const bundles = namespaceBundles(enUS, ptBR)
  i18n.addResourceBundle('en-US', namespace, bundles['en-US'])
  i18n.addResourceBundle('pt-BR', namespace, bundles['pt-BR'])
}
