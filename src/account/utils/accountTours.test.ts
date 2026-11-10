import { describeTourCopy } from '../../shared/utils/describeTourCopy'
import enUS from '../locales/en-US'
import ptBR from '../locales/pt-BR'
import { ACCOUNT_TOURS } from './accountTours'

describeTourCopy('ACCOUNT_TOURS', ACCOUNT_TOURS, { 'pt-BR': ptBR, 'en-US': enUS })
