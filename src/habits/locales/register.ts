import { registerNamespace } from '../../i18n/registerNamespace'
import enUS from './en-US'
import ptBR from './pt-BR'

// Imported by HabitsLayout: the `habits` namespace ships in the module's chunk, not in the entry bundle.
registerNamespace('habits', enUS, ptBR)
