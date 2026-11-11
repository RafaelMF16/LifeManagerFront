import commonEnUS from '../shared/locales/en-US'
import commonPtBR from '../shared/locales/pt-BR'
import authEnUS from '../auth/locales/en-US'
import authPtBR from '../auth/locales/pt-BR'
import homeEnUS from '../home/locales/en-US'
import homePtBR from '../home/locales/pt-BR'
import { namespaceBundles } from './namespaceBundles'

/**
 * The namespaces in the entry bundle: the shared texts and the screens anyone may open first (sign-in, home). The
 * Finance and Habits namespaces load with their module (`registerNamespace`), so `/auth` never downloads them.
 */
export const EAGER_NAMESPACES = ['common', 'auth', 'home'] as const

const common = namespaceBundles(commonEnUS, commonPtBR)
const auth = namespaceBundles(authEnUS, authPtBR)
const home = namespaceBundles(homeEnUS, homePtBR)

export const resources = {
  'en-US': { common: common['en-US'], auth: auth['en-US'], home: home['en-US'] },
  'pt-BR': { common: common['pt-BR'], auth: auth['pt-BR'], home: home['pt-BR'] },
}
