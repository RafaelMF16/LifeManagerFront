import { describeTourCopy } from '../../shared/utils/describeTourCopy'
import enUS from '../locales/en-US'
import ptBR from '../locales/pt-BR'
import { HOME_TOURS } from './homeTours'

describeTourCopy('HOME_TOURS', HOME_TOURS, { 'pt-BR': ptBR, 'en-US': enUS })
