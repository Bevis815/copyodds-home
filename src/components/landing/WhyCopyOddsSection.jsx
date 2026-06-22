import { useTranslation } from 'react-i18next'
import { Reveal } from './Reveal'
import { RevealStagger } from './RevealStagger'

export function WhyCopyOddsSection() {
  const { t } = useTranslation()
  const points = t('landing.why.points', { returnObjects: true })

  return (
    <Reveal as="section" className="landing-why surface-panel rounded-2xl p-5 sm:rounded-[32px] sm:p-8 lg:p-10" id="why">
      <div className="landing-why__grid">
        <div className="landing-why__intro-block">
          <span className="eyebrow mb-3 sm:mb-4">{t('landing.why.eyebrow')}</span>
          <h2 className="font-display text-[clamp(1.65rem,4vw,2.5rem)] font-semibold leading-[1.12] tracking-[-0.04em] text-white">
            {t('landing.why.title')}
          </h2>
          <p className="landing-feature__body mt-4 text-[15px] leading-7 text-slate-300 sm:text-base sm:leading-8">
            {t('landing.why.body')}
          </p>
        </div>

        <RevealStagger as="ul" className="landing-why__list" stagger={85}>
          {points.map((point) => (
            <li className="landing-why__item landing-hover-lift" key={point.title}>
              <span className="landing-why__bullet" aria-hidden />
              <div>
                <strong className="block text-sm font-semibold text-white sm:text-base">{point.title}</strong>
                <p className="mt-1.5 text-[13px] leading-6 text-slate-400 sm:text-sm">{point.body}</p>
              </div>
            </li>
          ))}
        </RevealStagger>
      </div>
    </Reveal>
  )
}
