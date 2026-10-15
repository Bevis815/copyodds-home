import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { LandingBackdrop } from '../components/landing/LandingBackdrop'
import { SupportContactPanel } from '../components/SupportEntry'
import {
  IconArrowRight,
  IconBriefcase,
  IconChartBar,
  IconCode,
  IconGlobe,
  IconMegaphone,
  IconPercent,
  IconShieldCheck,
  IconTelegram,
  IconUsers,
} from '../components/ui/Icons'
import { SectionReveal, Stagger, StaggerItem } from '../components/ui/Motion'
import { useDocumentSeo } from '../hooks/useDocumentSeo'
import { useLocale } from '../hooks/useLocale'
import { SITE } from '../lib/site'
import { getTelegramSupportHref } from '../lib/support'

const STATS = ['commission', 'languages', 'data', 'manager']

const AUDIENCES = [
  { key: 'team', icon: IconUsers },
  { key: 'kol', icon: IconMegaphone },
  { key: 'agency', icon: IconBriefcase },
  { key: 'community', icon: IconGlobe },
  { key: 'studio', icon: IconChartBar },
  { key: 'developer', icon: IconCode },
]

const BENEFITS = [
  { key: 'commission', icon: IconPercent },
  { key: 'dashboard', icon: IconChartBar },
  { key: 'materials', icon: IconMegaphone },
  { key: 'whiteLabel', icon: IconCode },
  { key: 'settlement', icon: IconShieldCheck },
  { key: 'global', icon: IconGlobe },
]

const MODELS = ['referral', 'agent', 'whiteLabel']

const STEPS = ['contact', 'plan', 'setup', 'grow']

function SectionIntro({ id, ns }) {
  const { t } = useTranslation()
  return (
    <SectionReveal className="site-section__intro">
      <p className="eyebrow">{t(`cooperation.${ns}.eyebrow`)}</p>
      <h2 className="site-section__title" id={id}>
        {t(`cooperation.${ns}.title`)}
      </h2>
      <p className="site-section__body">{t(`cooperation.${ns}.body`)}</p>
    </SectionReveal>
  )
}

function CardGrid({ ns, items }) {
  const { t } = useTranslation()
  return (
    <Stagger className="coop-grid" delay={0.05}>
      {items.map((item) => {
        const Icon = item.icon
        return (
          <StaggerItem key={item.key}>
            <article className="community-card coop-card">
              <span className="community-card__icon coop-card__icon">
                <Icon className="size-5" />
              </span>
              <h3 className="community-card__title">{t(`cooperation.${ns}.items.${item.key}.title`)}</h3>
              <p className="community-card__body">{t(`cooperation.${ns}.items.${item.key}.body`)}</p>
            </article>
          </StaggerItem>
        )
      })}
    </Stagger>
  )
}

export function CooperationPage() {
  const { t } = useTranslation()
  const { localizePath } = useLocale()
  const supportHref = getTelegramSupportHref()
  const faqItems = t('cooperation.faq.items', { returnObjects: true })
  const faqs = Array.isArray(faqItems) ? faqItems : []
  useDocumentSeo({ page: 'cooperation' })

  return (
    <div className="landing-page relative min-h-screen w-full">
      <LandingBackdrop />

      <Header logoHref={localizePath('/')} fullWidth compact />

      <main className="relative z-[1] flex w-full flex-col pb-16 pt-6 sm:pb-20 sm:pt-10">
        <div className="landing-shell flex flex-col gap-20 sm:gap-24">
          <section className="coop-hero" aria-labelledby="coop-title">
            <nav className="partner-guide__crumb" aria-label={t('cooperation.breadcrumbAria')}>
              <Link to={localizePath('/')}>{t('common.home')}</Link>
              <span aria-hidden="true">/</span>
              <span>{t('cooperation.breadcrumb')}</span>
            </nav>

            <div className="coop-hero__grid">
              <SectionReveal className="coop-hero__copy">
                <p className="coop-hero__badge">
                  <IconGlobe className="size-3.5" />
                  {t('cooperation.hero.badge')}
                </p>
                <h1 className="coop-hero__title" id="coop-title">
                  {t('cooperation.hero.titleLine1')}
                  <span className="coop-hero__highlight">{t('cooperation.hero.titleHighlight')}</span>
                </h1>
                <p className="coop-hero__subtitle">{t('cooperation.hero.subtitle')}</p>
                <div className="coop-hero__actions">
                  <a className="btn-primary coop-btn-gold" href={supportHref} target="_blank" rel="noreferrer">
                    <IconTelegram className="size-4" />
                    {t('cooperation.hero.primaryCta')}
                  </a>
                  <a className="btn-secondary" href="#coop-models">
                    {t('cooperation.hero.secondaryCta')}
                    <IconArrowRight className="size-3.5" />
                  </a>
                </div>
              </SectionReveal>

              <Stagger className="coop-stats" delay={0.1}>
                {STATS.map((key) => (
                  <StaggerItem key={key} className="coop-stat">
                    <strong>{t(`cooperation.stats.${key}.value`)}</strong>
                    <span>{t(`cooperation.stats.${key}.label`)}</span>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>

            <SectionReveal className="coop-hero__banner" delay={0.1}>
              <img
                src={SITE.bannerImage}
                alt={t('landing.hero.recruit.bannerAlt')}
                width={SITE.bannerWidth}
                height={SITE.bannerHeight}
                decoding="async"
                fetchPriority="high"
              />
            </SectionReveal>
          </section>

          <section className="site-section" aria-labelledby="coop-audience">
            <SectionIntro id="coop-audience" ns="audience" />
            <CardGrid ns="audience" items={AUDIENCES} />
          </section>

          <section className="site-section" aria-labelledby="coop-benefits">
            <SectionIntro id="coop-benefits" ns="benefits" />
            <CardGrid ns="benefits" items={BENEFITS} />
          </section>

          <section className="site-section" id="coop-models" aria-labelledby="coop-models-title">
            <SectionIntro id="coop-models-title" ns="models" />
            <Stagger className="coop-models" delay={0.05}>
              {MODELS.map((key) => {
                const points = t(`cooperation.models.items.${key}.points`, { returnObjects: true })
                return (
                  <StaggerItem key={key} className={`coop-model ${key === 'agent' ? 'is-featured' : ''}`}>
                    {key === 'agent' ? <span className="coop-model__tag">{t('cooperation.models.featured')}</span> : null}
                    <h3 className="coop-model__title">{t(`cooperation.models.items.${key}.title`)}</h3>
                    <p className="coop-model__fit">{t(`cooperation.models.items.${key}.fit`)}</p>
                    <ul className="coop-model__points">
                      {(Array.isArray(points) ? points : []).map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                    {key === 'whiteLabel' ? (
                      <Link className="coop-model__link" to={localizePath(SITE.docs.partners)}>
                        {t('cooperation.models.guideLink')}
                        <IconArrowRight className="size-3.5" />
                      </Link>
                    ) : null}
                  </StaggerItem>
                )
              })}
            </Stagger>
          </section>

          <section className="site-section" aria-labelledby="coop-steps">
            <SectionIntro id="coop-steps" ns="steps" />
            <ol className="coop-steps">
              {STEPS.map((key, index) => (
                <li key={key} className="coop-step">
                  <span className="coop-step__index">{String(index + 1).padStart(2, '0')}</span>
                  <h3 className="coop-step__title">{t(`cooperation.steps.items.${key}.title`)}</h3>
                  <p className="coop-step__body">{t(`cooperation.steps.items.${key}.body`)}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="site-section" aria-labelledby="coop-faq">
            <SectionIntro id="coop-faq" ns="faq" />
            <div className="seo-faq">
              {faqs.map((item) => (
                <article className="seo-faq__item" key={item.q}>
                  <h3>{item.q}</h3>
                  <p>{item.a}</p>
                </article>
              ))}
            </div>
          </section>

          <SectionReveal as="section" className="cta-banner coop-cta" id="coop-contact">
            <h2>{t('cooperation.cta.title')}</h2>
            <p>{t('cooperation.cta.body')}</p>
            <SupportContactPanel className="coop-cta__contacts" />
            <p className="coop-cta__hint">{t('cooperation.cta.hint')}</p>
          </SectionReveal>
        </div>
      </main>

      <Footer fullWidth />
    </div>
  )
}
