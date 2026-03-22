import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import account from './locales/en/account.json'
import analysis from './locales/en/analysis.json'
import auth from './locales/en/auth.json'
import checkout from './locales/en/checkout.json'
import common from './locales/en/common.json'
import errors from './locales/en/errors.json'
import faq from './locales/en/faq.json'
import pricing from './locales/en/pricing.json'
import privacy from './locales/en/privacy.json'
import resumeAnalyzer from './locales/en/resume-analyzer.json'
import seo from './locales/en/seo.json'

export const resources = {
  en: {
    common,
    auth,
    account,
    resumeAnalyzer,
    analysis,
    pricing,
    checkout,
    errors,
    seo,
    privacy,
    faq
  }
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  defaultNS: 'common',
  interpolation: {
    escapeValue: false
  }
})

export default i18n
