import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLocale } from '../../hooks/useLocale'
import { SITE } from '../../lib/site'
import { IconArrowRight, IconShieldCheck } from '../ui/Icons'
import { SectionReveal } from '../ui/Motion'

export function TrustStrip() {
  const { t } = useTranslation()
  const { localizePath } = useLocale()

  return (
    <SectionReveal as="section" className="trust-strip" id="trust" aria-labelledby="trust-strip-title">
      <div className="trust-strip__inner">
        <span className="trust-strip__icon" aria-hidden="true">
          <IconShieldCheck className="size-5" />
        </span>
        <div className="trust-strip__copy">
          <p className="eyebrow">{t('landing.trustStrip.eyebrow')}</p>
          <h2 className="trust-strip__title" id="trust-strip-title">
            {t('landing.trustStrip.title')}
          </h2>
          <p className="trust-strip__body">{t('landing.trustStrip.body')}</p>
        </div>
        <Link className="btn-secondary trust-strip__cta" to={localizePath(SITE.docs.trust)}>
          {t('landing.trustStrip.cta')}
          <IconArrowRight className="size-3.5" />
        </Link>
      </div>
    </SectionReveal>
  )
}
