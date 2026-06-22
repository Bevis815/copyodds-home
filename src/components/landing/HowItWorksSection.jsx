import { useTranslation } from 'react-i18next'
import { Reveal } from './Reveal'
import { RevealStagger } from './RevealStagger'

export function HowItWorksSection() {
  const { t } = useTranslation()
  const steps = t('landing.howItWorks.steps', { returnObjects: true })

  return (
    <section className="landing-how" id="how-it-works">
      <Reveal className="landing-how__intro">
        <span className="eyebrow mb-3 sm:mb-4">{t('landing.howItWorks.eyebrow')}</span>
        <h2 className="font-display text-[clamp(1.65rem,4vw,2.75rem)] font-semibold leading-[1.12] tracking-[-0.04em] text-white">
          {t('landing.howItWorks.title')}
        </h2>
      </Reveal>

      <RevealStagger as="ol" className="landing-steps" stagger={90}>
        {steps.map((step, index) => (
          <li className="landing-step surface-card landing-hover-lift" key={step.title}>
            <span className="landing-step__index" aria-hidden>
              {String(index + 1).padStart(2, '0')}
            </span>
            <div>
              <h3 className="font-display text-base font-semibold text-white sm:text-lg">{step.title}</h3>
              <p className="mt-2 text-[13px] leading-6 text-slate-400 sm:text-sm sm:leading-7">{step.body}</p>
            </div>
            {index < steps.length - 1 ? (
              <span className="landing-step__connector hidden lg:block" aria-hidden />
            ) : null}
          </li>
        ))}
      </RevealStagger>
    </section>
  )
}
