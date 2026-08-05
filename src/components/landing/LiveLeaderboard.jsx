import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { SITE } from '../../lib/site'
import { formatNumber, formatScore, abbreviateWallet } from '../../utils/format'
import { fetchSmartMoneyLeaderboard } from '../../services/smartMoney'
import { AnimatedNumber } from '../ui/AnimatedNumber'

const MotionAside = motion.aside
const MotionTr = motion.tr

const FALLBACK_TRADERS = [
  { name: 'AlphaWhale', winRate: 0.68, roi: 1.42, followers: 1840, aiScore: 92.4 },
  { name: 'PolyEdge', winRate: 0.61, roi: 0.94, followers: 1260, aiScore: 87.1 },
  { name: 'SignalFox', winRate: 0.64, roi: 0.81, followers: 980, aiScore: 84.6 },
  { name: 'MarketMaven', winRate: 0.59, roi: 0.72, followers: 740, aiScore: 81.2 },
  { name: 'OddsOracle', winRate: 0.57, roi: 0.66, followers: 610, aiScore: 79.8 },
]

function mapApiTrader(item, index) {
  const name =
    item?.displayName ||
    item?.name ||
    abbreviateWallet(item?.wallet || item?.address) ||
    `Trader ${index + 1}`
  return {
    name,
    winRate: item?.winRate ?? item?.metrics?.winRate ?? null,
    roi: item?.totalReturn ?? item?.roi ?? item?.metrics?.totalReturn ?? null,
    followers: item?.followers ?? item?.profileViews ?? item?.views ?? null,
    aiScore: item?.score ?? item?.compositeScore ?? item?.smartScore ?? null,
  }
}

function MetricCell({ label, children }) {
  return (
    <div className="min-w-0">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  )
}

export function LiveLeaderboard() {
  const { t } = useTranslation()
  const [traders, setTraders] = useState(FALLBACK_TRADERS)
  const [live, setLive] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchSmartMoneyLeaderboard({ limit: 5, offset: 0, eligibleOnly: true, rankBy: 'ALL' })
      .then((data) => {
        if (cancelled) return
        const mapped = (data.items || []).slice(0, 5).map(mapApiTrader)
        if (mapped.length > 0) {
          setTraders(mapped)
          setLive(true)
        }
      })
      .catch(() => {
        /* keep fallback sample */
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <MotionAside
      className="hero-board"
      aria-label={t('landing.heroBoard.aria')}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
    >
      <div className="hero-board__chrome">
        <div>
          <p className="hero-board__kicker">{t('landing.heroBoard.kicker')}</p>
          <h2 className="hero-board__title">{t('landing.heroBoard.title')}</h2>
        </div>
        <span className={`hero-board__live ${live ? 'is-live' : ''}`}>
          <span className="hero-board__live-dot" aria-hidden />
          {live ? t('landing.heroBoard.live') : t('landing.heroBoard.sample')}
        </span>
      </div>

      <div className="hero-board__table-wrap">
        <table className="hero-board__table">
          <thead>
            <tr>
              <th scope="col">{t('landing.heroBoard.colTrader')}</th>
              <th scope="col">{t('landing.heroBoard.colWinRate')}</th>
              <th scope="col">{t('landing.heroBoard.colRoi')}</th>
              <th scope="col">{t('landing.heroBoard.colFollowers')}</th>
              <th scope="col">{t('landing.heroBoard.colAiScore')}</th>
            </tr>
          </thead>
          <tbody>
            {traders.map((trader, index) => (
              <MotionTr
                key={`${trader.name}-${index}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + index * 0.07, duration: 0.45 }}
              >
                <td>
                  <div className="hero-board__trader">
                    <span className="hero-board__rank">{index + 1}</span>
                    <span className="hero-board__avatar" aria-hidden>
                      {(trader.name || '?').slice(0, 1).toUpperCase()}
                    </span>
                    <span className="hero-board__name">{trader.name}</span>
                  </div>
                </td>
                <td>
                  <MetricCell label={t('landing.heroBoard.colWinRate')}>
                    {trader.winRate != null ? (
                      <AnimatedNumber
                        value={Math.abs(trader.winRate) <= 1 ? trader.winRate * 100 : trader.winRate}
                        decimals={1}
                        format={(n) => `${n.toFixed(1)}%`}
                        className="tabular-nums text-brand-profit"
                      />
                    ) : (
                      <span className="text-brand-muted">—</span>
                    )}
                  </MetricCell>
                </td>
                <td>
                  <MetricCell label={t('landing.heroBoard.colRoi')}>
                    {trader.roi != null ? (
                      <AnimatedNumber
                        value={Math.abs(trader.roi) <= 1 ? trader.roi * 100 : trader.roi}
                        decimals={1}
                        format={(n) => `${n > 0 ? '+' : ''}${n.toFixed(1)}%`}
                        className="tabular-nums text-brand-profit"
                      />
                    ) : (
                      <span className="text-brand-muted">—</span>
                    )}
                  </MetricCell>
                </td>
                <td>
                  <MetricCell label={t('landing.heroBoard.colFollowers')}>
                    {trader.followers != null ? (
                      <AnimatedNumber
                        value={trader.followers}
                        format={(n) => formatNumber(n)}
                        className="tabular-nums"
                      />
                    ) : (
                      <span className="text-brand-muted">—</span>
                    )}
                  </MetricCell>
                </td>
                <td>
                  <MetricCell label={t('landing.heroBoard.colAiScore')}>
                    {trader.aiScore != null ? (
                      <AnimatedNumber
                        value={trader.aiScore}
                        decimals={1}
                        format={(n) => formatScore(n)}
                        className="tabular-nums text-brand-blue-soft"
                      />
                    ) : (
                      <span className="text-brand-muted">—</span>
                    )}
                  </MetricCell>
                </td>
              </MotionTr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="hero-board__footer">
        <a className="text-link" href={SITE.leaderboardUrl}>
          {t('landing.heroBoard.explore')} →
        </a>
      </div>
    </MotionAside>
  )
}
