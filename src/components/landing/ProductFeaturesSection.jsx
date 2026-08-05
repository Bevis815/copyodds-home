import { useTranslation } from 'react-i18next'
import { SITE } from '../../lib/site'
import { SectionReveal, Stagger, StaggerItem } from '../ui/Motion'

const FEATURE_KEYS = ['discovery', 'ai', 'execution', 'backtest', 'api', 'opensource']

export function ProductFeaturesSection() {
  const { t } = useTranslation()

  return (
    <section className="site-section" id="product">
      <SectionReveal className="site-section__intro">
        <p className="eyebrow">{t('landing.product.eyebrow')}</p>
        <h2 className="site-section__title" id="features">
          {t('landing.product.title')}
        </h2>
        <p className="site-section__body">{t('landing.product.body')}</p>
      </SectionReveal>

      <Stagger className="feature-grid" delay={0.05}>
        {FEATURE_KEYS.map((key) => (
          <StaggerItem key={key}>
            <article className="feature-card">
              <span className="feature-card__index" aria-hidden>
                {String(FEATURE_KEYS.indexOf(key) + 1).padStart(2, '0')}
              </span>
              <h3>{t(`landing.product.features.${key}.title`)}</h3>
              <p>{t(`landing.product.features.${key}.body`)}</p>
            </article>
          </StaggerItem>
        ))}
      </Stagger>

      <SectionReveal className="product-cta" delay={0.1}>
        <a className="btn-primary" href={SITE.appUrl}>
          {t('landing.hero.launchApp')}
        </a>
        <a className="btn-secondary" href={SITE.docs.home} target="_blank" rel="noreferrer">
          {t('landing.hero.docs')}
        </a>
      </SectionReveal>
    </section>
  )
}
