import i18n from '../../i18n/i18n'
import { registerNamespace } from '../../i18n/registerNamespace'
import enUS from './en-US'
import ptBR from './pt-BR'

// Imported first by the module's layout: the `habits` namespace ships in the module's chunk, not in the entry bundle.
registerNamespace(i18n, 'habits', enUS, ptBR)
