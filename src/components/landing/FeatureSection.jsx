import { Reveal } from './Reveal'

export function FeatureSection({
  id,
  eyebrow,
  title,
  body,
  children,
  reverse = false,
  className = '',
}) {
  return (
    <section
      className={`landing-feature ${reverse ? 'landing-feature--reverse' : ''} ${className}`.trim()}
      id={id}
    >
      <Reveal className="landing-feature__copy" delay={0}>
        <span className="eyebrow mb-3 sm:mb-4">{eyebrow}</span>
        <h2 className="font-display text-[clamp(1.65rem,4vw,2.75rem)] font-semibold leading-[1.12] tracking-[-0.04em] text-white">
          {title}
        </h2>
        <p className="landing-feature__body mt-4 text-[15px] leading-7 text-slate-300 sm:text-base sm:leading-8">
          {body}
        </p>
      </Reveal>
      <Reveal className="landing-feature__visual" delay={120}>
        {children}
      </Reveal>
    </section>
  )
}
