import { useTranslation } from 'react-i18next'
import { SectionReveal } from '../ui/Motion'

export function SeoFaqSection() {
  const { t } = useTranslation()
  const items = t('landing.faq.items', { returnObjects: true })
  const faqs = Array.isArray(items) ? items : []

  return (
    <section className="site-section" id="faq" aria-labelledby="faq-title">
      <SectionReveal className="site-section__intro">
        <p className="eyebrow">{t('landing.faq.eyebrow')}</p>
        <h2 className="site-section__title" id="faq-title">
          {t('landing.faq.title')}
        </h2>
        <p className="site-section__body">{t('landing.faq.body')}</p>
      </SectionReveal>

      <div className="seo-faq">
        {faqs.map((item) => (
          <article className="seo-faq__item" key={item.q}>
            <h3>{item.q}</h3>
            <p>{item.a}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
