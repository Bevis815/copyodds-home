import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatScore,
  getScoreTone,
  getSharpeTone,
} from '../utils/format'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLocale } from '../hooks/useLocale'
import { setSmartMoneyListPreview } from '../lib/smartMoneySessionCache'
import xLogo from '../assets/x.png'

const X_PROFILE_BASE_URL = 'https://x.com'

function getOfficialProfileUrl(wallet, locale) {
  const seg = locale === 'zh' ? 'zh' : 'en'
  return `https://polymarket.com/${seg}/${wallet}`
}

function normalizeXHandle(username) {
  if (username == null || username === '') {
    return null
  }
  const handle = String(username).trim().replace(/^@+/, '')
  return handle === '' ? null : handle
}

function getXProfileUrl(username) {
  const handle = normalizeXHandle(username)
  if (!handle) {
    return null
  }
  return `${X_PROFILE_BASE_URL}/${encodeURIComponent(handle)}`
}

function getRankChipClass(rank) {
  if (rank === 1) {
    return 'rank-top-1'
  }

  if (rank === 2) {
    return 'rank-top-2'
  }

  if (rank === 3) {
    return 'rank-top-3'
  }

  return 'border-white/10 bg-white/[0.03] text-slate-200'
}

function getRowClass(rank) {
  if (rank === 1) {
    return 'row-top-1'
  }

  if (rank === 2) {
    return 'row-top-2'
  }

  if (rank === 3) {
    return 'row-top-3'
  }

  return ''
}

function TraderIdentity({ item, t, locale }) {
  const displayName = item.displayName ?? t('leaderboardTable.unnamed')
  const profileUrl = getOfficialProfileUrl(item.wallet, locale)
  const xUrl = getXProfileUrl(item.xUsername)

  return (
    <div className="flex items-center gap-1.5 sm:gap-3">
      {item.profileImage ? (
        <img
          className="size-8 shrink-0 rounded-full border border-white/10 object-cover shadow-[0_10px_20px_rgba(0,0,0,0.22)] sm:size-10"
          src={item.profileImage}
          alt={displayName}
        />
      ) : (
        <div
          className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#F5C542]/16 bg-[#F5C542]/10 font-display text-xs font-bold text-[#F8D978] sm:size-10 sm:text-base"
          aria-hidden="true"
        >
          {displayName.slice(0, 1).toUpperCase()}
        </div>
      )}
      <div className="min-w-0 grid gap-0 sm:gap-1">
        <a
          className="block max-w-[min(100%,11rem)] truncate text-[12px] font-semibold leading-tight text-white transition hover:text-[#F8D978] sm:max-w-[160px] sm:text-[15px]"
          href={profileUrl}
          target="_blank"
          rel="noreferrer"
          title={displayName}
        >
          <strong className="block truncate font-semibold">{displayName}</strong>
        </a>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-500 sm:text-xs">
          {xUrl ? (
            <a
              className="inline-flex shrink-0 rounded  border-white/10 bg-white/[0.03] p-1 transition hover:border-[#F8D978]/35 hover:bg-white/[0.06]"
              href={xUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={t('leaderboardTable.openXTitle')}
              aria-label={t('leaderboardTable.openXAria')}
            >
              <img
                src={xLogo}
                alt=""
                className="h-4 w-4 object-contain sm:h-[18px] sm:w-[18px]"
                width={18}
                height={18}
                decoding="async"
              />
            </a>
          ) : (
            <span className="text-slate-500" title={t('leaderboardTable.noXTitle')}>
              {t('leaderboardTable.noX')}
            </span>
          )}
        </span>
      </div>
    </div>
  )
}

const statShell =
  'min-w-0 rounded-md border border-white/8 bg-black/20 px-1.5 py-1 sm:min-w-[92px] sm:rounded-lg sm:px-2 sm:py-1.5 md:rounded-xl md:px-3 md:py-2.5'

function CompactStat({ label, value, numericValue, variant = 'plain' }) {
  const valueBase =
    'mt-0.5 whitespace-nowrap text-[0.72rem] font-semibold leading-tight tabular-nums sm:mt-1 sm:text-[0.8rem] md:mt-1.5 md:text-[0.95rem]'

  let valueClass = `${valueBase} text-slate-200`

  if (variant === 'currency') {
    valueClass = `${valueBase} text-emerald-300/95`
  } else if (variant === 'score' && numericValue != null && !Number.isNaN(Number(numericValue))) {
    valueClass = `${valueBase} font-display tracking-[-0.02em] score-${getScoreTone(Number(numericValue))}`
  } else if (variant === 'percent' && numericValue != null && !Number.isNaN(Number(numericValue))) {
    const n = Number(numericValue)
    const normalized = Math.abs(n) <= 1 ? n * 100 : n
    valueClass = `${valueBase} font-display tracking-[-0.02em] score-${getScoreTone(normalized)}`
  } else if (variant === 'sharpe' && numericValue != null && !Number.isNaN(Number(numericValue))) {
    valueClass = `${valueBase} font-display tracking-[-0.02em] score-${getSharpeTone(Number(numericValue))}`
  }

  const labelClass =
    variant === 'currency'
      ? 'text-[6px] font-semibold uppercase leading-tight tracking-[0.08em] text-emerald-500/55 sm:text-[7px] sm:tracking-[0.12em] md:text-[9px] md:tracking-[0.14em]'
      : 'text-[6px] font-semibold uppercase leading-tight tracking-[0.08em] text-slate-500 sm:text-[7px] sm:tracking-[0.12em] md:text-[9px] md:tracking-[0.14em]'

  return (
    <div className={statShell}>
      <p className={labelClass}>{label}</p>
      <p className={valueClass}>{value}</p>
    </div>
  )
}

function rememberListPreview(item, listPosition, rankBy) {
  setSmartMoneyListPreview(item.wallet, {
    displayName: item.displayName ?? null,
    profileImage: item.profileImage ?? null,
    rank: listPosition,
    score: item.score != null ? String(item.score) : null,
    rankBy: rankBy ?? null,
  })
}

export function LeaderboardTable({ items, rankBy = 'ALL', listOffset = 0 }) {
  const { t } = useTranslation()
  const { localizePath, locale } = useLocale()

  return (
    <div className="grid gap-2 sm:gap-3 md:gap-4">
      {items.map((item, index) => {
        /** 展示名次与当前列表序一致；API 的 item.rank 为内部评分序，与 rankBy 无关 */
        const listPosition = listOffset + index + 1
        const detailPath = localizePath(`/backtest/${encodeURIComponent(item.wallet)}`)
        return (
          <article
            className={`surface-card rounded-xl p-2 sm:rounded-2xl sm:p-3 md:rounded-[24px] md:p-4.5 ${getRowClass(listPosition)}`}
            key={item.wallet}
          >
            <div className="grid gap-2 sm:gap-2.5 md:gap-3 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)_auto] lg:items-center lg:gap-4">
              <div className="flex min-w-0 items-start justify-between gap-2 lg:items-center lg:justify-start">
                <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-3">
                  <span
                    className={`inline-flex min-h-7 min-w-7 shrink-0 items-center justify-center rounded-full border px-1.5 text-[11px] font-bold sm:min-h-10 sm:min-w-10 sm:px-3 sm:text-sm ${getRankChipClass(listPosition)}`}
                    title={t('leaderboardTable.rankTitle')}
                  >
                    {listPosition}
                  </span>
                  <div className="min-w-0 flex-1">
                    <TraderIdentity item={item} t={t} locale={locale} />
                  </div>
                </div>
                <Link
                  className="interactive-focus relative shrink-0 rounded-full border border-[#F5C542]/45 bg-[linear-gradient(165deg,rgba(248,217,120,0.22),rgba(184,137,30,0.12))] px-3 py-1.5 text-[11px] font-semibold text-[#FFF1BF] shadow-[0_0_16px_rgba(245,197,66,0.12)] backdrop-blur-[2px] transition active:scale-[0.97] lg:hidden"
                  to={detailPath}
                  onClick={() => rememberListPreview(item, listPosition, rankBy)}
                >
                  {t('leaderboardTable.detail')}
                </Link>
              </div>

              <div className="grid min-w-0 grid-cols-3 gap-1 sm:flex sm:flex-wrap sm:gap-1.5 md:gap-2 lg:min-w-0 lg:flex-1 lg:flex-nowrap">
                <CompactStat label={t('leaderboardTable.predictions')} value={formatNumber(item.predictionCount)} variant="plain" />
                <CompactStat
                  label={t('leaderboardTable.holdings')}
                  value={formatCurrency(item.holdingsValue)}
                  variant="currency"
                />
                <CompactStat
                  label={t('leaderboardTable.pnlQuality')}
                  value={formatScore(item.pnlQuality)}
                  numericValue={item.pnlQuality}
                  variant="score"
                />
                <div className="hidden sm:block">
                  <CompactStat
                    label={t('leaderboardTable.consistency')}
                    value={formatScore(item.consistencyScore)}
                    numericValue={item.consistencyScore}
                    variant="score"
                  />
                </div>
                <CompactStat
                  label={t('leaderboardTable.activity')}
                  value={formatScore(item.activityScore)}
                  numericValue={item.activityScore}
                  variant="score"
                />
                <CompactStat
                  label={t('leaderboardTable.winRate')}
                  value={formatPercent(item.externalWinRate)}
                  numericValue={item.externalWinRate}
                  variant="percent"
                />
                <CompactStat
                  label={t('leaderboardTable.sharpe')}
                  value={formatScore(item.externalSharpeRatio)}
                  numericValue={item.externalSharpeRatio}
                  variant="sharpe"
                />
              </div>

              <div className="hidden shrink-0 items-center justify-end lg:flex">
                <Link
                  className="btn-gold interactive-focus inline-flex min-h-[48px] items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.16em] lg:min-h-[52px] lg:py-3"
                  to={detailPath}
                  onClick={() => rememberListPreview(item, listPosition, rankBy)}
                >
                  {t('leaderboardTable.detail')}
                </Link>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
