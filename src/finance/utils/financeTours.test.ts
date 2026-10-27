import { describeTourCopy } from '../../shared/utils/describeTourCopy'
import enUS from '../locales/en-US'
import ptBR from '../locales/pt-BR'
import { FINANCE_TOURS } from './financeTours'

describeTourCopy('FINANCE_TOURS', FINANCE_TOURS, { 'pt-BR': ptBR, 'en-US': enUS })
