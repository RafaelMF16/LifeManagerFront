import i18n from './i18n'
import { namespaceBundles } from './namespaceBundles'

type Resource = { [key: string]: unknown }

/**
 * Adds a module's namespace, in both languages, when the module's chunk loads. Called at the top of the module's
 * locale entry (`finance/locales/register.ts`, `habits/locales/register.ts`), which its layout imports: the router
 * evaluates the route modules before rendering them, so the texts are there by the first render.
 */
export function registerNamespace(namespace: string, enUS: Resource, ptBR: Resource) {
  if (i18n.hasResourceBundle('en-US', namespace)) return

  const bundles = namespaceBundles(enUS, ptBR)
  i18n.addResourceBundle('en-US', namespace, bundles['en-US'])
  i18n.addResourceBundle('pt-BR', namespace, bundles['pt-BR'])
}
