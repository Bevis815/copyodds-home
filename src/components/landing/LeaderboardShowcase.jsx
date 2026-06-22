import { useTranslation } from 'react-i18next'
import { leaderboardUrl } from '../../lib/app-links'
import { FeatureSection } from './FeatureSection'
import { MiniSparkline } from './MiniSparkline'
import { RevealStagger } from './RevealStagger'

const SPARK_VARIANTS = ['up', 'mid', 'calm', 'steady', 'climb']

function MetricChip({ label, value, tone = 'neutral' }) {
  const toneClass =
    tone === 'positive' ? 'landing-chip--positive' : tone === 'accent' ? 'landing-chip--accent' : ''

  return (
    <div className={`landing-chip ${toneClass}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function FeaturedTraderCard({ trader, sparkVariant }) {
  return (
    <article className="landing-bento-featured surface-card landing-hover-lift">
      <div className="landing-bento-featured__glow" aria-hidden />
      <div className="landing-bento-featured__head">
        <div className="landing-bento-featured__identity">
          <span className="landing-bento-rank">{trader.rank}</span>
          <div className="landing-mock-avatar landing-mock-avatar--xl" aria-hidden />
          <div className="min-w-0">
            <strong className="block truncate font-display text-lg font-semibold text-white sm:text-xl">
              {trader.name}
            </strong>
            <span className="text-xs text-slate-400">{trader.trades}</span>
          </div>
        </div>
        <span className={`landing-mock-risk landing-mock-risk--${trader.riskTone}`}>{trader.risk}</span>
      </div>

      <p className="landing-bento-featured__pnl score-positive">{trader.pnl}</p>
      <p className="landing-bento-featured__pnl-label">{trader.pnlLabel}</p>

      <div className="landing-bento-chips">
        <MetricChip label={trader.winRateLabel} value={trader.winRate} tone="positive" />
        <MetricChip label={trader.scoreLabel} value={trader.score} tone="accent" />
        <MetricChip label={trader.holdingsLabel} value={trader.holdings} />
      </div>

      <MiniSparkline variant={sparkVariant} className="landing-bento-featured__spark" />
    </article>
  )
}

function CompactTraderCard({ trader, sparkVariant }) {
  return (
    <article className="landing-bento-compact surface-card landing-hover-lift">
      <div className="landing-bento-compact__row">
        <span className="landing-bento-rank landing-bento-rank--sm">{trader.rank}</span>
        <div className="landing-mock-avatar" aria-hidden />
        <div className="min-w-0 flex-1">
          <strong className="block truncate text-sm font-semibold text-white">{trader.name}</strong>
          <span className="text-[11px] text-slate-400">{trader.trades}</span>
        </div>
        <div className="landing-bento-compact__figures">
          <strong className="score-positive text-sm">{trader.pnl}</strong>
          <span className="text-[10px] text-slate-500">{trader.winRate}</span>
        </div>
        <span className={`landing-mock-risk landing-mock-risk--${trader.riskTone}`}>{trader.risk}</span>
      </div>
      <MiniSparkline variant={sparkVariant} className="landing-bento-compact__spark" />
    </article>
  )
}

export function LeaderboardShowcase() {
  const { t } = useTranslation()
  const traders = t('landing.leaderboard.traders', { returnObjects: true })
  const dimensions = t('landing.leaderboard.dimensions', { returnObjects: true })
  const [featured, ...rest] = traders

  return (
    <FeatureSection
      id="leaderboard"
      eyebrow={t('landing.leaderboard.eyebrow')}
      title={t('landing.leaderboard.title')}
      body={t('landing.leaderboard.body')}
    >
      <div className="landing-bento">
        <div className="landing-bento__signals">
          {dimensions.map((item) => (
            <span className="landing-signal-pill" key={item}>
              {item}
            </span>
          ))}
        </div>

        <RevealStagger className="landing-bento__grid" stagger={80}>
          <FeaturedTraderCard trader={featured} sparkVariant={SPARK_VARIANTS[0]} />
          <RevealStagger className="landing-bento__stack" stagger={65}>
            {rest.map((trader, index) => (
              <CompactTraderCard
                key={trader.name}
                trader={trader}
                sparkVariant={SPARK_VARIANTS[(index + 1) % SPARK_VARIANTS.length]}
              />
            ))}
          </RevealStagger>
        </RevealStagger>

        <div className="landing-bento__footer">
          <p className="text-xs text-slate-500">{t('landing.leaderboard.sampleNote')}</p>
          <a className="landing-explore-link interactive-focus" href={leaderboardUrl()}>
            {t('landing.leaderboard.exploreCta')}
            <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </FeatureSection>
  )
}
