import { useTranslation } from 'react-i18next'
import { SITE } from '../../lib/site'
import { SectionReveal } from '../ui/Motion'

export function RoadmapSection() {
  const { t } = useTranslation()
  const items = t('landing.roadmap.items', { returnObjects: true })

  return (
    <section className="site-section" id="roadmap">
      <SectionReveal className="site-section__intro">
        <p className="eyebrow">{t('landing.roadmap.eyebrow')}</p>
        <h2 className="site-section__title">{t('landing.roadmap.title')}</h2>
        <p className="site-section__body">{t('landing.roadmap.body')}</p>
      </SectionReveal>

      <SectionReveal className="roadmap-list" delay={0.08}>
        {(Array.isArray(items) ? items : []).map((item) => (
          <article className="roadmap-item" key={item.title}>
            <span className={`roadmap-item__status roadmap-item__status--${item.status}`}>
              {t(`landing.roadmap.status.${item.status}`)}
            </span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </SectionReveal>

      <SectionReveal className="mt-8" delay={0.12}>
        <a className="text-link" href={SITE.docs.roadmap} target="_blank" rel="noreferrer">
          {t('landing.roadmap.viewIssues')} →
        </a>
      </SectionReveal>
    </section>
  )
}
