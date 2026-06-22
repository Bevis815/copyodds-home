import { useTranslation } from 'react-i18next'

function DashboardChrome({ title }) {
  return (
    <div className="landing-dash-chrome">
      <span className="landing-mock-dot landing-mock-dot--red" />
      <span className="landing-mock-dot landing-mock-dot--amber" />
      <span className="landing-mock-dot landing-mock-dot--green" />
      <span className="landing-dash-chrome__title">{title}</span>
    </div>
  )
}

function StatCell({ label, value, tone = 'neutral' }) {
  const toneClass =
    tone === 'positive' ? 'score-positive' : tone === 'risk' ? 'score-risk' : tone === 'accent' ? 'score-warm' : ''

  return (
    <div className="landing-dash-stat">
      <span>{label}</span>
      <strong className={toneClass}>{value}</strong>
    </div>
  )
}

export function HeroDashboardMock() {
  const { t } = useTranslation()
  const trader = t('landing.heroMock.topTrader', { returnObjects: true })
  const backtest = t('landing.heroMock.backtest', { returnObjects: true })
  const copy = t('landing.heroMock.copySettings', { returnObjects: true })

  return (
    <div className="landing-dashboard" aria-label={t('landing.heroMock.aria')}>
      <div className="landing-dashboard__glow" aria-hidden />
      <div className="landing-dashboard__frame surface-panel landing-float-slow">
        <DashboardChrome title={t('landing.heroMock.dashboardTitle')} />

        <div className="landing-dashboard__grid">
          <article className="landing-dash-card">
            <header className="landing-dash-card__head">
              <div className="landing-mock-avatar landing-mock-avatar--lg" aria-hidden />
              <div className="min-w-0">
                <p className="landing-dash-card__kicker">{trader.kicker}</p>
                <h3 className="truncate font-display text-base font-semibold text-white">{trader.name}</h3>
              </div>
              <span className={`landing-mock-risk landing-mock-risk--${trader.riskTone}`}>{trader.risk}</span>
            </header>
            <div className="landing-dash-card__stats landing-dash-card__stats--2x2">
              <StatCell label={trader.winRateLabel} value={trader.winRate} tone="positive" />
              <StatCell label={trader.pnlLabel} value={trader.pnl} tone="positive" />
              <StatCell label={trader.scoreLabel} value={trader.score} tone="accent" />
              <StatCell label={trader.riskLabel} value={trader.riskShort} tone="neutral" />
            </div>
          </article>

          <article className="landing-dash-card">
            <header className="landing-dash-card__head landing-dash-card__head--solo">
              <div>
                <p className="landing-dash-card__kicker">{backtest.kicker}</p>
                <h3 className="font-display text-base font-semibold text-white">{backtest.title}</h3>
              </div>
            </header>
            <svg className="landing-dash-mini-curve" viewBox="0 0 240 64" preserveAspectRatio="none" aria-hidden>
              <defs>
                <linearGradient id="dashCurveFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(245,197,66,0.35)" />
              <stop offset="100%" stopColor="rgba(245,197,66,0)" />
                </linearGradient>
              </defs>
              <path
                d="M0,48 C30,44 50,36 80,30 S140,18 180,22 S220,12 240,8 L240,64 L0,64 Z"
                fill="url(#dashCurveFill)"
              />
              <path
                d="M0,48 C30,44 50,36 80,30 S140,18 180,22 S220,12 240,8"
                fill="none"
                stroke="#F5C542"
                strokeWidth="2"
                className="landing-sparkline-line"
              />
            </svg>
            <div className="landing-dash-card__stats landing-dash-card__stats--3col">
              <StatCell label={backtest.returnLabel} value={backtest.returnValue} tone="positive" />
              <StatCell label={backtest.ddLabel} value={backtest.ddValue} tone="risk" />
              <StatCell label={backtest.tradesLabel} value={backtest.tradesValue} />
            </div>
          </article>

          <article className="landing-dash-card landing-dash-card--wide">
            <header className="landing-dash-card__head landing-dash-card__head--solo">
              <div>
                <p className="landing-dash-card__kicker">{copy.kicker}</p>
                <h3 className="font-display text-base font-semibold text-white">{copy.title}</h3>
              </div>
              <span className="landing-status-pill landing-status-pill--active">{copy.status}</span>
            </header>
            <div className="landing-dash-card__stats landing-dash-card__stats--3col">
              <StatCell label={copy.maxPositionLabel} value={copy.maxPositionValue} />
              <StatCell label={copy.marketCapLabel} value={copy.marketCapValue} />
              <StatCell label={copy.traderLabel} value={copy.traderValue} />
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}
