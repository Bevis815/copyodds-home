import { Link } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { LandingBackdrop } from '../components/landing/LandingBackdrop'
import { SupportContactPanel } from '../components/SupportEntry'
import {
  IconArrowRight,
  IconBook,
  IconChartBar,
  IconCode,
  IconExternal,
  IconSearch,
  IconShieldCheck,
} from '../components/ui/Icons'
import { SectionReveal, Stagger, StaggerItem } from '../components/ui/Motion'
import { useDocumentSeo } from '../hooks/useDocumentSeo'
import { useLocale } from '../hooks/useLocale'
import { SITE } from '../lib/site'
import { getTelegramSupportHref } from '../lib/support'

const TOC = [
  { id: 'funds', key: 'funds' },
  { id: 'transparency', key: 'transparency' },
  { id: 'fees', key: 'fees' },
  { id: 'security', key: 'security' },
  { id: 'support', key: 'support' },
  { id: 'faq', key: 'faq' },
]

const FUND_FLOW = ['deposit', 'allocate', 'execute', 'withdraw']

const TRANSPARENCY_POINTS = ['discovery', 'signal', 'sizing', 'risks', 'backtest']

const FEE_POINTS = ['platform', 'gas', 'timing', 'withdraw']

const SECURITY_POINTS = ['keys', 'access', 'records', 'audit']

function SectionIntro({ id, ns }) {
  const { t } = useTranslation()
  return (
    <SectionReveal className="site-section__intro">
      <p className="eyebrow">{t(`trust.${ns}.eyebrow`)}</p>
      <h2 className="site-section__title" id={id}>
        {t(`trust.${ns}.title`)}
      </h2>
      <p className="site-section__body">{t(`trust.${ns}.body`)}</p>
    </SectionReveal>
  )
}

function PendingNote({ ns }) {
  const { t } = useTranslation()
  const note = t(`trust.${ns}.pending`, { defaultValue: '' })
  if (!note) return null
  return <p className="trust-pending">{note}</p>
}

export function TrustPage() {
  const { t } = useTranslation()
  const { localizePath } = useLocale()
  const supportHref = getTelegramSupportHref()
  const faqItems = t('trust.faq.items', { returnObjects: true })
  const faqs = Array.isArray(faqItems) ? faqItems : []
  const fundBullets = t('trust.funds.bullets', { returnObjects: true })
  const fundsList = Array.isArray(fundBullets) ? fundBullets : []
  useDocumentSeo({ page: 'trust' })

  return (
    <div className="landing-page relative min-h-screen w-full">
      <LandingBackdrop />

      <Header logoHref={localizePath('/')} fullWidth compact />

      <main className="relative z-[1] flex w-full flex-col pb-16 pt-6 sm:pb-20 sm:pt-10">
        <div className="landing-shell flex flex-col gap-20 sm:gap-24">
          <section className="trust-hero" aria-labelledby="trust-title">
            <nav className="legal-doc__crumb" aria-label={t('trust.breadcrumbAria')}>
              <Link to={localizePath('/')}>{t('common.home')}</Link>
              <span aria-hidden="true">/</span>
              <span>{t('trust.breadcrumb')}</span>
            </nav>

            <SectionReveal className="trust-hero__copy">
              <p className="eyebrow">{t('trust.hero.eyebrow')}</p>
              <h1 className="trust-hero__title" id="trust-title">
                {t('trust.hero.title')}
              </h1>
              <p className="trust-hero__subtitle">{t('trust.hero.subtitle')}</p>
              <div className="trust-hero__actions">
                <a className="btn-primary" href="#funds">
                  {t('trust.hero.ctaFunds')}
                </a>
                <a className="btn-secondary" href="#transparency">
                  {t('trust.hero.ctaTransparency')}
                  <IconArrowRight className="size-3.5" />
                </a>
              </div>
            </SectionReveal>

            <nav className="trust-toc" aria-label={t('trust.tocAria')}>
              {TOC.map((item) => (
                <a key={item.id} href={`#${item.id}`}>
                  {t(`trust.toc.${item.key}`)}
                </a>
              ))}
            </nav>
          </section>

          <section className="site-section trust-section" id="funds" aria-labelledby="trust-funds">
            <SectionIntro id="trust-funds" ns="funds" />
            <PendingNote ns="funds" />

            <ol className="trust-flow">
              {FUND_FLOW.map((key, index) => (
                <li key={key} className="trust-flow__step">
                  <span className="trust-flow__index" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3>{t(`trust.funds.flow.${key}.title`)}</h3>
                  <p>{t(`trust.funds.flow.${key}.body`)}</p>
                </li>
              ))}
            </ol>

            <ul className="trust-list">
              {fundsList.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <p className="trust-footnote">
              <Trans
                i18nKey="trust.funds.privacyLink"
                components={{
                  privacy: <Link to={localizePath(SITE.docs.privacy)} />,
                }}
              />
            </p>
          </section>

          <section className="site-section trust-section" id="transparency" aria-labelledby="trust-transparency">
            <SectionIntro id="trust-transparency" ns="transparency" />
            <PendingNote ns="transparency" />

            <Stagger className="trust-points" delay={0.04}>
              {TRANSPARENCY_POINTS.map((key) => (
                <StaggerItem key={key}>
                  <article className="trust-point">
                    <h3>{t(`trust.transparency.points.${key}.title`)}</h3>
                    <p>{t(`trust.transparency.points.${key}.body`)}</p>
                  </article>
                </StaggerItem>
              ))}
            </Stagger>

            <div className="trust-links">
              <a className="trust-link" href={SITE.leaderboardUrl} target="_blank" rel="noreferrer">
                <IconChartBar className="size-4" />
                <span>{t('trust.transparency.links.leaderboard')}</span>
                <IconExternal className="size-3.5" />
              </a>
              <Link className="trust-link" to={localizePath('/blog/copy-trade-polymarket')}>
                <IconBook className="size-4" />
                <span>{t('trust.transparency.links.guide')}</span>
                <IconArrowRight className="size-3.5" />
              </Link>
              <a
                className="trust-link"
                href="https://polygonscan.com"
                target="_blank"
                rel="noreferrer"
              >
                <IconSearch className="size-4" />
                <span>{t('trust.transparency.links.explorer')}</span>
                <IconExternal className="size-3.5" />
              </a>
            </div>
          </section>

          <section className="site-section trust-section" id="fees" aria-labelledby="trust-fees">
            <SectionIntro id="trust-fees" ns="fees" />
            <PendingNote ns="fees" />

            <Stagger className="trust-points" delay={0.04}>
              {FEE_POINTS.map((key) => (
                <StaggerItem key={key}>
                  <article className="trust-point">
                    <h3>{t(`trust.fees.points.${key}.title`)}</h3>
                    <p>{t(`trust.fees.points.${key}.body`)}</p>
                  </article>
                </StaggerItem>
              ))}
            </Stagger>

            <div className="trust-links">
              <a className="trust-link" href={SITE.appUrl} target="_blank" rel="noreferrer">
                <IconExternal className="size-4" />
                <span>{t('trust.fees.links.app')}</span>
              </a>
              <a className="trust-link" href={supportHref} target="_blank" rel="noreferrer">
                <IconArrowRight className="size-4" />
                <span>{t('trust.fees.links.support')}</span>
              </a>
            </div>
          </section>

          <section className="site-section trust-section" id="security" aria-labelledby="trust-security">
            <SectionIntro id="trust-security" ns="security" />
            <PendingNote ns="security" />

            <Stagger className="trust-points trust-points--security" delay={0.04}>
              {SECURITY_POINTS.map((key) => (
                <StaggerItem key={key}>
                  <article className="trust-point">
                    <span className="trust-point__icon" aria-hidden="true">
                      {key === 'audit' ? (
                        <IconCode className="size-4" />
                      ) : (
                        <IconShieldCheck className="size-4" />
                      )}
                    </span>
                    <h3>{t(`trust.security.points.${key}.title`)}</h3>
                    <p>{t(`trust.security.points.${key}.body`)}</p>
                  </article>
                </StaggerItem>
              ))}
            </Stagger>

            <div className="trust-links">
              <a className="trust-link" href={SITE.github.web.url} target="_blank" rel="noreferrer">
                <IconCode className="size-4" />
                <span>{t('trust.security.links.web')}</span>
                <IconExternal className="size-3.5" />
              </a>
              <a className="trust-link" href={SITE.github.services.url} target="_blank" rel="noreferrer">
                <IconCode className="size-4" />
                <span>{t('trust.security.links.services')}</span>
                <IconExternal className="size-3.5" />
              </a>
              <Link className="trust-link" to={localizePath(SITE.docs.privacy)}>
                <IconBook className="size-4" />
                <span>{t('trust.security.links.privacy')}</span>
                <IconArrowRight className="size-3.5" />
              </Link>
            </div>
          </section>

          <section className="site-section trust-section" id="support" aria-labelledby="trust-support">
            <SectionIntro id="trust-support" ns="support" />

            <div className="trust-support-grid">
              <article className="trust-support-card">
                <h3>{t('trust.support.channels.title')}</h3>
                <p>{t('trust.support.channels.body')}</p>
                <SupportContactPanel className="trust-support-card__contacts" />
              </article>

              <article className="trust-support-card">
                <h3>{t('trust.support.docs.title')}</h3>
                <ul className="trust-list trust-list--compact">
                  <li>
                    <Link to={localizePath(SITE.docs.privacy)}>{t('footer.privacy')}</Link>
                    <span>{t('trust.support.docs.privacyHint')}</span>
                  </li>
                  <li>
                    <span>{t('footer.terms')}</span>
                    <span>{t('trust.support.docs.termsHint')}</span>
                  </li>
                  <li>
                    <Link to={localizePath('/blog/copy-trade-polymarket#risks')}>
                      {t('trust.support.docs.riskLabel')}
                    </Link>
                    <span>{t('trust.support.docs.riskHint')}</span>
                  </li>
                  <li>
                    <a href={SITE.github.orgUrl} target="_blank" rel="noreferrer">
                      {t('trust.support.docs.githubLabel')}
                    </a>
                    <span>{t('trust.support.docs.githubHint')}</span>
                  </li>
                </ul>
              </article>
            </div>
          </section>

          <section className="site-section trust-section" id="faq" aria-labelledby="trust-faq">
            <SectionIntro id="trust-faq" ns="faq" />
            <div className="seo-faq">
              {faqs.map((item) => (
                <article className="seo-faq__item" key={item.q}>
                  <h3>{item.q}</h3>
                  <p>{item.a}</p>
                  {item.pending ? <p className="trust-pending trust-pending--inline">{item.pending}</p> : null}
                </article>
              ))}
            </div>
          </section>

          <SectionReveal as="section" className="cta-banner trust-cta" id="trust-next">
            <h2>{t('trust.cta.title')}</h2>
            <p>{t('trust.cta.body')}</p>
            <div className="trust-cta__actions">
              <a className="btn-primary" href={SITE.appUrl} target="_blank" rel="noreferrer">
                {t('landing.hero.launchApp')}
              </a>
              <a className="btn-secondary" href={supportHref} target="_blank" rel="noreferrer">
                {t('support.telegram')}
              </a>
            </div>
          </SectionReveal>
        </div>
      </main>

      <Footer fullWidth />
    </div>
  )
}
