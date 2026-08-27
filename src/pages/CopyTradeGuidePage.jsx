import { Link } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { LandingBackdrop } from '../components/landing/LandingBackdrop'
import { IconTelegram } from '../components/ui/Icons'
import { BLOG_INDEX_PATH, COPY_TRADE_GUIDE } from '../content/blog'
import { useLocale } from '../hooks/useLocale'
import { useDocumentSeo } from '../hooks/useDocumentSeo'
import { SITE } from '../lib/site'

const TOC = [
  { key: 'canYou', href: '#can-you-copy-trade' },
  { key: 'why', href: '#why-copy-trade' },
  { key: 'how', href: '#how-it-works' },
  { key: 'setup', href: '#setup' },
  { key: 'pick', href: '#pick-wallet' },
  { key: 'risks', href: '#risks' },
]

const HOW_KEYS = ['discovery', 'analysis', 'execution', 'opensource']
const SETUP_KEYS = ['open', 'account', 'pick', 'backtest', 'activate']
const SETUP_STEPS_WITH_LINKS = new Set(['open', 'pick'])
const PICK_KEYS = ['consistency', 'history', 'trend', 'diversity']
const RISK_KEYS = ['judgment', 'limits', 'diversify']

function InlineLink({ href, children, external = true }) {
  if (!external) {
    return (
      <Link className="blog-guide__inline-link" to={href}>
        {children}
      </Link>
    )
  }
  return (
    <a className="blog-guide__inline-link" href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  )
}

function GuideSection({ id, kicker, title, children }) {
  return (
    <section className="partner-guide__panel" aria-labelledby={id}>
      <div className="partner-guide__part-head">
        {kicker ? <p className="partner-guide__part-kicker">{kicker}</p> : null}
        <h2 id={id} className="partner-guide__part-title">
          {title}
        </h2>
      </div>
      {children}
    </section>
  )
}

export function CopyTradeGuidePage() {
  const { t } = useTranslation()
  const { localizePath } = useLocale()
  useDocumentSeo({ page: 'copyTrade' })

  const faqItems = t('blog.copyTrade.faq.items', { returnObjects: true })
  const faqs = Array.isArray(faqItems) ? faqItems : []

  return (
    <div className="landing-page relative min-h-screen w-full">
      <LandingBackdrop />

      <Header logoHref={localizePath('/')} fullWidth compact />

      <main className="relative z-[1] flex w-full flex-col pb-16 pt-6 sm:pb-20 sm:pt-10">
        <article className="landing-shell partner-guide blog-guide">
          <nav className="partner-guide__crumb" aria-label={t('blog.breadcrumbAria')}>
            <Link to={localizePath('/')}>{t('common.home')}</Link>
            <span aria-hidden="true">/</span>
            <Link to={localizePath(BLOG_INDEX_PATH)}>{t('blog.breadcrumb')}</Link>
            <span aria-hidden="true">/</span>
            <span>{t('blog.copyTrade.crumb')}</span>
          </nav>

          <header className="partner-guide__hero">
            <p className="eyebrow">{t('blog.copyTrade.eyebrow')}</p>
            <h1 className="partner-guide__title">{t('blog.copyTrade.title')}</h1>
            <p className="partner-guide__subtitle">{t('blog.copyTrade.subtitle')}</p>
            <div className="partner-guide__meta" aria-label={t('blog.copyTrade.metaAria')}>
              <span>{t('blog.copyTrade.meta.time')}</span>
              <span>{t('blog.copyTrade.meta.category')}</span>
              <span>{t('blog.copyTrade.meta.updated')}</span>
            </div>
          </header>

          <section className="partner-guide__overview" aria-labelledby="copy-trade-overview">
            <div className="partner-guide__overview-head">
              <h2 id="copy-trade-overview" className="partner-guide__part-title">
                {t('blog.copyTrade.toc.title')}
              </h2>
              <p className="partner-guide__part-body">{t('blog.copyTrade.toc.body')}</p>
            </div>
            <ol className="partner-guide__overview-grid blog-guide__toc-grid">
              {TOC.map((item, index) => (
                <li key={item.key}>
                  <a className="partner-guide__overview-card" href={item.href}>
                    <span className="partner-guide__overview-index">{index + 1}</span>
                    <span className="partner-guide__overview-title">
                      {t(`blog.copyTrade.toc.items.${item.key}.title`)}
                    </span>
                    <span className="partner-guide__overview-body">
                      {t(`blog.copyTrade.toc.items.${item.key}.body`)}
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </section>

          <GuideSection
            id="can-you-copy-trade"
            kicker={t('blog.copyTrade.canYou.kicker')}
            title={t('blog.copyTrade.canYou.title')}
          >
            <div className="blog-guide__prose">
              <p>{t('blog.copyTrade.canYou.p1')}</p>
              <p>
                <Trans
                  i18nKey="blog.copyTrade.canYou.p2"
                  components={{
                    app: <InlineLink href={SITE.appUrl} />,
                    strong: <strong />,
                  }}
                />
              </p>
            </div>
          </GuideSection>

          <GuideSection id="why-copy-trade" kicker={t('blog.copyTrade.why.kicker')} title={t('blog.copyTrade.why.title')}>
            <div className="blog-guide__prose">
              <p>{t('blog.copyTrade.why.p1')}</p>
              <p>{t('blog.copyTrade.why.p2')}</p>
            </div>
          </GuideSection>

          <GuideSection id="how-it-works" kicker={t('blog.copyTrade.how.kicker')} title={t('blog.copyTrade.how.title')}>
            <p className="partner-guide__part-body blog-guide__lead">{t('blog.copyTrade.how.intro')}</p>
            <ul className="partner-guide__tips">
              {HOW_KEYS.map((key) => (
                <li key={key}>
                  <strong>{t(`blog.copyTrade.how.items.${key}.title`)}</strong>
                  <p>{t(`blog.copyTrade.how.items.${key}.body`)}</p>
                </li>
              ))}
            </ul>
          </GuideSection>

          <GuideSection id="setup" kicker={t('blog.copyTrade.setup.kicker')} title={t('blog.copyTrade.setup.title')}>
            <p className="partner-guide__part-body blog-guide__lead">{t('blog.copyTrade.setup.intro')}</p>
            <ol className="partner-guide__steps">
              {SETUP_KEYS.map((key, index) => (
                <li className="partner-guide__step" key={key}>
                  <span className="partner-guide__step-num" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="partner-guide__step-main">
                    <div className="partner-guide__step-copy">
                      <h3 className="partner-guide__step-title">
                        {t(`blog.copyTrade.setup.steps.${key}.title`)}
                      </h3>
                      <div className="partner-guide__step-content">
                        <p>
                          {SETUP_STEPS_WITH_LINKS.has(key) ? (
                            <Trans
                              i18nKey={`blog.copyTrade.setup.steps.${key}.body`}
                              components={{
                                app: <InlineLink href={SITE.appUrl} />,
                                telegram: <InlineLink href={SITE.social.telegram} />,
                                leaderboard: <InlineLink href={SITE.leaderboardUrl} />,
                                strong: <strong />,
                              }}
                            />
                          ) : (
                            t(`blog.copyTrade.setup.steps.${key}.body`)
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </GuideSection>

          <GuideSection
            id="pick-wallet"
            kicker={t('blog.copyTrade.pick.kicker')}
            title={t('blog.copyTrade.pick.title')}
          >
            <p className="partner-guide__part-body blog-guide__lead">{t('blog.copyTrade.pick.intro')}</p>
            <ul className="partner-guide__tips">
              {PICK_KEYS.map((key) => (
                <li key={key}>
                  <strong>{t(`blog.copyTrade.pick.items.${key}.title`)}</strong>
                  <p>{t(`blog.copyTrade.pick.items.${key}.body`)}</p>
                </li>
              ))}
            </ul>
          </GuideSection>

          <GuideSection id="risks" kicker={t('blog.copyTrade.risks.kicker')} title={t('blog.copyTrade.risks.title')}>
            <div className="blog-guide__prose">
              <p>{t('blog.copyTrade.risks.intro')}</p>
            </div>
            <ul className="partner-guide__tips">
              {RISK_KEYS.map((key) => (
                <li key={key}>
                  <strong>{t(`blog.copyTrade.risks.items.${key}.title`)}</strong>
                  <p>{t(`blog.copyTrade.risks.items.${key}.body`)}</p>
                </li>
              ))}
            </ul>
          </GuideSection>

          <GuideSection
            id="vs-manual"
            kicker={t('blog.copyTrade.vsManual.kicker')}
            title={t('blog.copyTrade.vsManual.title')}
          >
            <div className="blog-guide__prose">
              <p>{t('blog.copyTrade.vsManual.p1')}</p>
              <p>
                <Trans
                  i18nKey="blog.copyTrade.vsManual.p2"
                  components={{
                    github: <InlineLink href={SITE.github.web.url} />,
                    strong: <strong />,
                  }}
                />
              </p>
            </div>
          </GuideSection>

          {faqs.length > 0 ? (
            <GuideSection id="faq" kicker={t('blog.copyTrade.faq.kicker')} title={t('blog.copyTrade.faq.title')}>
              <div className="seo-faq">
                {faqs.map((item) => (
                  <article className="seo-faq__item" key={item.q}>
                    <h3>{item.q}</h3>
                    <p>{item.a}</p>
                  </article>
                ))}
              </div>
            </GuideSection>
          ) : null}

          <section className="partner-guide__panel partner-guide__panel--cta" aria-labelledby="copy-trade-cta">
            <div className="partner-guide__part-head">
              <p className="partner-guide__part-kicker">{t('blog.copyTrade.cta.kicker')}</p>
              <h2 id="copy-trade-cta" className="partner-guide__part-title">
                {t('blog.copyTrade.cta.title')}
              </h2>
              <p className="partner-guide__part-body">{t('blog.copyTrade.cta.body')}</p>
            </div>
            <div className="partner-guide__cta-row">
              <a className="btn-primary partner-guide__support-btn" href={SITE.appUrl}>
                {t('landing.hero.launchApp')}
              </a>
              <a
                className="btn-secondary partner-guide__support-btn"
                href={SITE.social.telegram}
                target="_blank"
                rel="noreferrer"
              >
                <IconTelegram className="size-4" />
                {t('landing.hero.openTelegramBot')}
              </a>
            </div>
            <p className="partner-guide__cta-hint">{t('blog.copyTrade.cta.hint')}</p>
          </section>
        </article>
      </main>

      <Footer
        fullWidth
        links={[
          { href: localizePath('/'), label: t('common.home') },
          { href: localizePath(BLOG_INDEX_PATH), label: t('blog.breadcrumb') },
          { href: localizePath(COPY_TRADE_GUIDE.path), label: t('blog.copyTrade.crumb') },
          { href: SITE.appUrl, label: t('landing.hero.launchApp'), external: true },
        ]}
      />
    </div>
  )
}
