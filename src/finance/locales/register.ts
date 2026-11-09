import { registerNamespace } from '../../i18n/registerNamespace'
import enUS from './en-US'
import ptBR from './pt-BR'

// Imported by FinanceLayout: the `finance` namespace ships in the module's chunk, not in the entry bundle.
registerNamespace('finance', enUS, ptBR)
