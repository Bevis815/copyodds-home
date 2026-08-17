import { locales, defaultLocale } from '../i18n/constants'
import { buildLocalizedPath } from '../i18n/path'
import { SITE } from './site'

/** BCP 47 tags used in hreflang / og:locale. */
export const SEO_LOCALES = {
  en: { hreflang: 'en', og: 'en_US' },
  zh: { hreflang: 'zh-Hans', og: 'zh_CN' },
  id: { hreflang: 'id', og: 'id_ID' },
  fr: { hreflang: 'fr', og: 'fr_FR' },
  ru: { hreflang: 'ru', og: 'ru_RU' },
  es: { hreflang: 'es', og: 'es_ES' },
}

const HREFLANG_ATTR = 'data-seo-hreflang'
const OG_LOCALE_ALT_ATTR = 'data-seo-og-alt'
const JSON_LD_ID = 'seo-jsonld'

export function siteOrigin() {
  return SITE.url.replace(/\/$/, '')
}

export function absoluteUrl(pathname = '/') {
  const origin = siteOrigin()
  if (!pathname || pathname === '/') {
    return `${origin}/`
  }
  return `${origin}${pathname.startsWith('/') ? pathname : `/${pathname}`}`
}

export function localizedAbsoluteUrl(locale, pathnameWithoutLocale = '/') {
  return absoluteUrl(buildLocalizedPath(locale, pathnameWithoutLocale))
}

export function ogImageUrl() {
  return SITE.ogImage || `${siteOrigin()}/logo.jpg`
}

function upsertMeta(attr, key, content) {
  if (content == null || content === '') {
    return
  }
  const selector = `meta[${attr}="${key}"]`
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel, href, extra = {}) {
  let el = document.head.querySelector(`link[rel="${rel}"]${extra.hreflang ? '' : ':not([hreflang])'}`)
  if (rel === 'canonical') {
    el = document.head.querySelector('link[rel="canonical"]')
  }
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
  for (const [k, v] of Object.entries(extra)) {
    if (v) el.setAttribute(k, v)
  }
}

function replaceManagedNodes(attr, nodes) {
  document.head.querySelectorAll(`[${attr}]`).forEach((el) => el.remove())
  nodes.forEach((node) => document.head.appendChild(node))
}

function setHreflangLinks(pathnameWithoutLocale) {
  const nodes = locales.map((locale) => {
    const link = document.createElement('link')
    link.setAttribute('rel', 'alternate')
    link.setAttribute('hreflang', SEO_LOCALES[locale]?.hreflang ?? locale)
    link.setAttribute('href', localizedAbsoluteUrl(locale, pathnameWithoutLocale))
    link.setAttribute(HREFLANG_ATTR, locale)
    return link
  })
  const xDefault = document.createElement('link')
  xDefault.setAttribute('rel', 'alternate')
  xDefault.setAttribute('hreflang', 'x-default')
  xDefault.setAttribute('href', localizedAbsoluteUrl(defaultLocale, pathnameWithoutLocale))
  xDefault.setAttribute(HREFLANG_ATTR, 'x-default')
  nodes.push(xDefault)
  replaceManagedNodes(HREFLANG_ATTR, nodes)
}

function setOgLocaleAlternates(currentLocale) {
  const nodes = locales
    .filter((locale) => locale !== currentLocale)
    .map((locale) => {
      const meta = document.createElement('meta')
      meta.setAttribute('property', 'og:locale:alternate')
      meta.setAttribute('content', SEO_LOCALES[locale]?.og ?? locale)
      meta.setAttribute(OG_LOCALE_ALT_ATTR, locale)
      return meta
    })
  replaceManagedNodes(OG_LOCALE_ALT_ATTR, nodes)
}

function setJsonLd(data) {
  let el = document.getElementById(JSON_LD_ID)
  if (!el) {
    el = document.createElement('script')
    el.id = JSON_LD_ID
    el.type = 'application/ld+json'
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

function sameAs() {
  return [SITE.github.orgUrl, SITE.github.web.url, SITE.github.services.url, SITE.social.x, SITE.social.telegram].filter(
    Boolean,
  )
}

export function buildJsonLd({ title, description, canonical, locale, page, faqItems }) {
  const inLanguage = SEO_LOCALES[locale]?.hreflang ?? locale
  const origin = siteOrigin()

  const organization = {
    '@type': 'Organization',
    '@id': `${origin}/#organization`,
    name: SITE.name,
    url: `${origin}/`,
    logo: SITE.logo || `${origin}/logo.jpg`,
    sameAs: sameAs(),
  }

  const website = {
    '@type': 'WebSite',
    '@id': `${origin}/#website`,
    name: SITE.name,
    url: `${origin}/`,
    inLanguage,
    description,
    publisher: { '@id': `${origin}/#organization` },
  }

  const software = {
    '@type': 'SoftwareApplication',
    '@id': `${origin}/#app`,
    name: SITE.name,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    url: `${origin}/`,
    description,
    inLanguage,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: { '@id': `${origin}/#organization` },
    codeRepository: [SITE.github.web.url, SITE.github.services.url],
    keywords:
      'Polymarket, open source, copy trading, smart money, wallet analysis, prediction market, 开源, 交易, 聪明钱, 地址分析',
  }

  const webpage = {
    '@type': 'WebPage',
    '@id': `${canonical}#webpage`,
    url: canonical,
    name: title,
    description,
    inLanguage,
    isPartOf: { '@id': `${origin}/#website` },
    about: { '@id': `${origin}/#app` },
  }

  const graph = [organization, website, software, webpage]

  if (page === 'home' && Array.isArray(faqItems) && faqItems.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${canonical}#faq`,
      inLanguage,
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a,
        },
      })),
    })
  }

  if (page === 'partners') {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE.name, item: localizedAbsoluteUrl(locale, '/') },
        { '@type': 'ListItem', position: 2, name: title, item: canonical },
      ],
    })
  }

  if (page === 'backtest') {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE.name, item: localizedAbsoluteUrl(locale, '/') },
        { '@type': 'ListItem', position: 2, name: title, item: canonical },
      ],
    })
  }

  return { '@context': 'https://schema.org', '@graph': graph }
}

/**
 * Update document title, meta, canonical, hreflang, and JSON-LD for the current route.
 * Intended for SPA crawlers (Google) and client navigations; static index.html remains the first-paint fallback.
 */
export function applyDocumentSeo({
  title,
  description,
  keywords,
  canonical,
  locale,
  pathnameWithoutLocale,
  page,
  faqItems,
}) {
  if (typeof document === 'undefined') {
    return
  }

  document.title = title
  document.documentElement.lang = SEO_LOCALES[locale]?.hreflang ?? locale

  upsertMeta('name', 'description', description)
  upsertMeta('name', 'keywords', keywords)
  upsertMeta('name', 'author', SITE.name)
  upsertMeta('name', 'application-name', SITE.name)
  upsertMeta('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1')

  upsertMeta('property', 'og:title', title)
  upsertMeta('property', 'og:description', description)
  upsertMeta('property', 'og:type', 'website')
  upsertMeta('property', 'og:url', canonical)
  upsertMeta('property', 'og:image', ogImageUrl())
  upsertMeta('property', 'og:image:alt', title)
  if (SITE.bannerWidth) upsertMeta('property', 'og:image:width', String(SITE.bannerWidth))
  if (SITE.bannerHeight) upsertMeta('property', 'og:image:height', String(SITE.bannerHeight))
  upsertMeta('property', 'og:site_name', SITE.name)
  upsertMeta('property', 'og:locale', SEO_LOCALES[locale]?.og ?? 'en_US')

  upsertMeta('name', 'twitter:card', 'summary_large_image')
  upsertMeta('name', 'twitter:title', title)
  upsertMeta('name', 'twitter:description', description)
  upsertMeta('name', 'twitter:image', ogImageUrl())
  if (SITE.twitterHandle) {
    upsertMeta('name', 'twitter:site', SITE.twitterHandle)
  }

  upsertLink('canonical', canonical)
  setHreflangLinks(pathnameWithoutLocale)
  setOgLocaleAlternates(locale)
  setJsonLd(
    buildJsonLd({
      title,
      description,
      canonical,
      locale,
      page,
      faqItems,
    }),
  )
}
