import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, getInitialLanguage } from '../shared/i18n/languages'
import commonEnUS from '../shared/locales/en-US'
import commonPtBR from '../shared/locales/pt-BR'
import authEnUS from '../auth/locales/en-US'
import authPtBR from '../auth/locales/pt-BR'
import homeEnUS from '../home/locales/en-US'
import homePtBR from '../home/locales/pt-BR'

void i18n.use(initReactI18next).init({
  resources: {
    'en-US': { common: commonEnUS, auth: authEnUS, home: homeEnUS },
    'pt-BR': { common: commonPtBR, auth: authPtBR, home: homePtBR },
  },
  lng: getInitialLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: SUPPORTED_LANGUAGES,
  ns: ['common', 'auth', 'home'],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
  returnNull: false,
})

document.documentElement.setAttribute('lang', i18n.language)

export default i18n
