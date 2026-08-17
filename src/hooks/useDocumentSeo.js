import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { applyDocumentSeo, localizedAbsoluteUrl } from '../lib/seo'
import { useLocale } from './useLocale'

function readFaqItems(t) {
  const items = t('landing.faq.items', { returnObjects: true })
  return Array.isArray(items) ? items.filter((item) => item?.q && item?.a) : []
}

/**
 * @param {{ page: 'home' | 'partners' | 'backtest', enabled?: boolean, name?: string, wallet?: string }} options
 */
export function useDocumentSeo({ page, enabled = true, name, wallet } = { page: 'home' }) {
  const { t, i18n } = useTranslation()
  const { locale, pathnameWithoutLocale } = useLocale()
  const { pathname } = useLocation()

  useEffect(() => {
    if (!enabled || !page) {
      return
    }

    const vars = {
      name: name || wallet || 'Polymarket',
      wallet: wallet || '',
    }
    const title = t(`seo.${page}.title`, vars)
    const description = t(`seo.${page}.description`, vars)
    const keywords = t(`seo.${page}.keywords`)
    const canonical = localizedAbsoluteUrl(locale, pathnameWithoutLocale)
    const faqItems = page === 'home' ? readFaqItems(t) : []

    applyDocumentSeo({
      title,
      description,
      keywords,
      canonical,
      locale,
      pathnameWithoutLocale,
      page,
      faqItems,
    })
  }, [enabled, page, name, wallet, locale, pathnameWithoutLocale, pathname, t, i18n.language])
}
