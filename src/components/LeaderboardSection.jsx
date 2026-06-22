import { useTranslation } from 'react-i18next'
import { formatPeriodLabel } from '../utils/format'
import { LeaderboardTable } from './LeaderboardTable'

/** 与 polymarket-frontend 聪明钱榜周期 Tab 一致 */
const LEADERBOARD_PERIOD_FILTERS = [
  { period: 'ALL' },
  { period: 'WEEK' },
  { period: 'MONTH' },
]

export function LeaderboardSection({
  id,
  rankBy,
  onRankByChange,
  listOffset = 0,
  candidateSource,
  visibleCount,
  totalCount,
  items,
  status,
  refreshing = false,
  error,
  hasMore,
  loadingMore,
  onLoadMore,
  onRetry,
}) {
  const { t } = useTranslation()

  return (
    <section className="surface-panel rounded-2xl p-4 sm:rounded-[32px] sm:p-7 lg:p-8" id={id}>
      <div className="flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="eyebrow mb-3 sm:mb-4">{t('leaderboard.eyebrow')}</span>
          <h2 className="font-display text-2xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
            {t('leaderboard.title')}
          </h2>
          <p className="mt-3 max-w-[60ch] text-[13px] leading-6 text-slate-300 sm:mt-4 sm:text-base sm:leading-7">
            {t('leaderboard.subtitle')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
          <span className="badge-metal rounded-full px-3 py-1.5 font-medium sm:px-4 sm:py-2">
            {t('leaderboard.countBadge', { visible: visibleCount, total: totalCount })}
          </span>
          <span className="badge-neutral rounded-full px-3 py-1.5 font-medium sm:px-4 sm:py-2">
            {t('leaderboard.sourcesBadge', { count: candidateSource.length })}
          </span>
        </div>
      </div>

      <div
        className="mt-4 flex flex-wrap gap-1.5 sm:mt-5 sm:gap-2"
        role="group"
        aria-label={t('leaderboard.filterGroupAria')}
      >
        {LEADERBOARD_PERIOD_FILTERS.map(({ period }) => {
          const isActive = rankBy === period
          const title =
            period === 'ALL'
              ? t('leaderboard.titleAll')
              : t('leaderboard.titlePeriod', { label: formatPeriodLabel(period) })
          return (
            <button
              key={period}
              type="button"
              disabled={refreshing}
              aria-pressed={isActive}
              title={title}
              onClick={() => onRankByChange(period)}
              className={`interactive-focus rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-50 ${
                isActive ? 'badge-metal' : 'badge-neutral'
              }`}
            >
              {formatPeriodLabel(period)}
            </button>
          )
        })}
      </div>

      {status === 'loading' && (
        <div className="surface-card mt-6 rounded-[28px] p-6">
          <strong className="font-display text-2xl font-semibold text-white">
            {t('leaderboard.loadingTitle')}
          </strong>
          <p className="mt-3 text-sm leading-7 text-slate-400">{t('leaderboard.loadingBody')}</p>
        </div>
      )}

      {status === 'error' && (
        <div className="surface-card mt-6 rounded-[28px] border border-rose-400/20 p-6">
          <strong className="font-display text-2xl font-semibold text-white">
            {t('leaderboard.errorTitle')}
          </strong>
          <p className="mt-3 text-sm leading-7 text-slate-400">{error}</p>
          <button
            className="btn-gold interactive-focus mt-5 rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em]"
            type="button"
            onClick={onRetry}
          >
            {t('leaderboard.retry')}
          </button>
        </div>
      )}

      {status === 'success' && items.length === 0 && (
        <div className="surface-card mt-6 rounded-[28px] p-6">
          <strong className="font-display text-2xl font-semibold text-white">
            {t('leaderboard.emptyTitle')}
          </strong>
          <p className="mt-3 text-sm leading-7 text-slate-400">{t('leaderboard.emptyBody')}</p>
        </div>
      )}

      {status === 'success' && items.length > 0 && (
        <div className="relative mt-4 sm:mt-6">
          {refreshing && (
            <div
              className="pointer-events-none absolute inset-0 z-[1] rounded-[28px] bg-black/35 backdrop-blur-[1px]"
              aria-hidden
            />
          )}
          <div
            className={refreshing ? 'opacity-60 transition-opacity duration-150' : ''}
            aria-busy={refreshing}
          >
            <LeaderboardTable items={items} rankBy={rankBy} listOffset={listOffset} />
          </div>
          {error && (
            <p className="mt-4 text-center text-sm text-rose-300/90" role="alert">
              {error}
            </p>
          )}
          {hasMore && (
            <div className="mt-6 flex justify-center sm:mt-8">
              <button
                className="btn-gold interactive-focus min-h-[44px] rounded-full px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-0 sm:px-8 sm:py-3.5 sm:text-sm sm:tracking-[0.16em]"
                type="button"
                disabled={loadingMore || refreshing}
                onClick={onLoadMore}
              >
                {loadingMore ? t('leaderboard.loadingMore') : t('leaderboard.loadMore')}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
