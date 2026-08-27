import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { LandingBackdrop } from '../components/landing/LandingBackdrop'
import { BLOG_INDEX_PATH, COPY_TRADE_GUIDE } from '../content/blog'
import { useLocale } from '../hooks/useLocale'
import { useDocumentSeo } from '../hooks/useDocumentSeo'
import { SITE } from '../lib/site'

export function BlogIndexPage() {
  const { t } = useTranslation()
  const { localizePath } = useLocale()
  useDocumentSeo({ page: 'blog' })

  return (
    <div className="landing-page relative min-h-screen w-full">
      <LandingBackdrop />

      <Header logoHref={localizePath('/')} fullWidth compact />

      <main className="relative z-[1] flex w-full flex-col pb-16 pt-6 sm:pb-20 sm:pt-10">
        <div className="landing-shell blog-index">
          <nav className="partner-guide__crumb" aria-label={t('blog.breadcrumbAria')}>
            <Link to={localizePath('/')}>{t('common.home')}</Link>
            <span aria-hidden="true">/</span>
            <span>{t('blog.breadcrumb')}</span>
          </nav>

          <header className="partner-guide__hero">
            <p className="eyebrow">{t('blog.index.eyebrow')}</p>
            <h1 className="partner-guide__title">{t('blog.index.title')}</h1>
            <p className="partner-guide__subtitle">{t('blog.index.subtitle')}</p>
          </header>

          <ul className="blog-index__list">
            <li>
              <Link className="blog-index__card" to={localizePath(COPY_TRADE_GUIDE.path)}>
                <p className="blog-index__kicker">{t('blog.copyTrade.eyebrow')}</p>
                <h2 className="blog-index__card-title">{t('blog.copyTrade.title')}</h2>
                <p className="blog-index__excerpt">{t('blog.copyTrade.excerpt')}</p>
                <div className="blog-index__meta">
                  <span>{t('blog.copyTrade.meta.time')}</span>
                  <span>{t('blog.copyTrade.meta.updated')}</span>
                </div>
                <span className="blog-index__cta">{t('blog.index.readCta')}</span>
              </Link>
            </li>
          </ul>
        </div>
      </main>

      <Footer
        fullWidth
        links={[
          { href: localizePath('/'), label: t('common.home') },
          { href: localizePath(BLOG_INDEX_PATH), label: t('blog.breadcrumb') },
          { href: SITE.appUrl, label: t('landing.hero.launchApp'), external: true },
        ]}
      />
    </div>
  )
}
