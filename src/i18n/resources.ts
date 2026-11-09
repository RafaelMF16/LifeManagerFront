import commonEnUS from '../shared/locales/en-US'
import commonPtBR from '../shared/locales/pt-BR'
import authEnUS from '../auth/locales/en-US'
import authPtBR from '../auth/locales/pt-BR'
import homeEnUS from '../home/locales/en-US'
import homePtBR from '../home/locales/pt-BR'
import financeEnUS from '../finance/locales/en-US'
import financePtBR from '../finance/locales/pt-BR'
import habitsEnUS from '../habits/locales/en-US'
import habitsPtBR from '../habits/locales/pt-BR'
import { withZeroPlurals } from './withZeroPlurals'

export const NAMESPACES = ['common', 'auth', 'home', 'finance', 'habits'] as const

/**
 * pt-BR goes through `withZeroPlurals` because its plural rule reads 0 as singular ("0 dia"); en-US already reads
 * 0 as plural. A namespace added here must be wrapped the same way.
 */
export const resources = {
  'en-US': { common: commonEnUS, auth: authEnUS, home: homeEnUS, finance: financeEnUS, habits: habitsEnUS },
  'pt-BR': {
    common: withZeroPlurals(commonPtBR),
    auth: withZeroPlurals(authPtBR),
    home: withZeroPlurals(homePtBR),
    finance: withZeroPlurals(financePtBR),
    habits: withZeroPlurals(habitsPtBR),
  },
}
