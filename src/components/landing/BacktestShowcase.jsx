import { useTranslation } from 'react-i18next'
import { FeatureSection } from './FeatureSection'

function BacktestChart() {
  return (
    <svg className="landing-backtest-chart landing-backtest-chart--hero" viewBox="0 0 520 240" role="img" aria-hidden>
      <defs>
        <linearGradient id="backtestFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(245,197,66,0.32)" />
          <stop offset="100%" stopColor="rgba(245,197,66,0)" />
        </linearGradient>
      </defs>
      {[48, 96, 144, 192].map((y) => (
        <line key={y} x1="0" y1={y} x2="520" y2={y} stroke="rgba(255,255,255,0.05)" />
      ))}
      <path
        d="M0,188 C40,182 70,168 110,152 S190,118 250,98 S350,58 410,42 S470,28 520,18 L520,240 L0,240 Z"
        fill="url(#backtestFill)"
      />
      <path
        d="M0,188 C40,182 70,168 110,152 S190,118 250,98 S350,58 410,42 S470,28 520,18"
        fill="none"
        stroke="#F5C542"
        strokeWidth="3"
        strokeLinecap="round"
        className="landing-sparkline-line landing-sparkline-line--lg"
      />
    </svg>
  )
}

function FloatingStat({ label, value, tone = 'neutral' }) {
  return (
    <div className="landing-float-stat">
      <span>{label}</span>
      <strong className={tone === 'positive' ? 'score-positive' : tone === 'risk' ? 'score-risk' : ''}>{value}</strong>
    </div>
  )
}

export function BacktestShowcase() {
  const { t } = useTranslation()
  const stats = t('landing.backtest.stats', { returnObjects: true })
  const headline = stats.find((s) => s.tone === 'positive') ?? stats[0]
  const drawdown = stats.find((s) => s.tone === 'risk') ?? stats[1]
  const others = stats.filter((s) => s !== headline && s !== drawdown)

  return (
    <FeatureSection
      id="backtest"
      eyebrow={t('landing.backtest.eyebrow')}
      title={t('landing.backtest.title')}
      body={t('landing.backtest.body')}
      reverse
    >
      <div className="landing-backtest-bento">
        <div className="landing-backtest-stage surface-card">
          <div className="landing-backtest-stage__top">
            <span className="badge-metal rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] sm:text-xs">
              {t('landing.backtest.periodBadge')}
            </span>
            <div className="landing-backtest-hero-stat">
              <span>{headline.label}</span>
              <strong className="score-positive">{headline.value}</strong>
            </div>
          </div>

          <div className="landing-backtest-stage__chart">
            <BacktestChart />
            <div className="landing-backtest-stage__overlay">
              <FloatingStat label={drawdown.label} value={drawdown.value} tone="risk" />
              {others.map((stat) => (
                <FloatingStat key={stat.label} label={stat.label} value={stat.value} />
              ))}
            </div>
          </div>
        </div>

        <blockquote className="landing-backtest-insight surface-card">
          <p className="text-sm leading-7 text-slate-300 sm:text-base">{t('landing.backtest.insight')}</p>
        </blockquote>
      </div>
    </FeatureSection>
  )
}
