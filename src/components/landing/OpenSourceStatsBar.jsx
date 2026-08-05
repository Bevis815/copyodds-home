import { AnimatedNumber } from '../ui/AnimatedNumber'
import { IconStar } from '../ui/Icons'
import { SectionReveal, Stagger, StaggerItem } from '../ui/Motion'
import { useGitHubStats } from '../../hooks/useGitHubStats'
import { SITE } from '../../lib/site'
import { formatNumber } from '../../utils/format'
import { useTranslation } from 'react-i18next'

export function OpenSourceStatsBar() {
  const { t } = useTranslation()
  const { stats, loading } = useGitHubStats()

  const cards = [
    {
      key: 'stars',
      label: t('landing.stats.stars'),
      value: stats.stars,
      icon: true,
      href: SITE.github.web.url,
    },
    {
      key: 'forks',
      label: t('landing.stats.forks'),
      value: stats.forks,
      href: `${SITE.github.web.url}/forks`,
    },
    {
      key: 'contributors',
      label: t('landing.stats.contributors'),
      value: stats.contributors,
      href: `${SITE.github.web.url}/graphs/contributors`,
    },
    {
      key: 'release',
      label: t('landing.stats.release'),
      text: stats.latestRelease?.tag || t('landing.stats.releaseSoon'),
      href: stats.latestRelease?.url || SITE.docs.releases,
    },
    {
      key: 'commits',
      label: t('landing.stats.weeklyCommits'),
      value: stats.weeklyCommits,
      href: SITE.github.web.url,
    },
    {
      key: 'license',
      label: t('landing.stats.license'),
      text: stats.license || SITE.license,
      href: SITE.docs.license,
    },
  ]

  return (
    <SectionReveal className="os-stats" as="section" aria-label={t('landing.stats.aria')}>
      <Stagger className="os-stats__grid">
        {cards.map((card) => (
          <StaggerItem key={card.key}>
            <a className="os-stat-card" href={card.href} target="_blank" rel="noreferrer">
              <span className="os-stat-card__label">
                {card.icon ? <IconStar className="size-3.5 text-brand-blue" /> : null}
                {card.label}
              </span>
              <strong className="os-stat-card__value">
                {card.text != null ? (
                  card.text
                ) : loading && !card.value ? (
                  <span className="os-stat-card__skeleton" aria-hidden />
                ) : (
                  <AnimatedNumber value={card.value || 0} format={(n) => formatNumber(n)} />
                )}
              </strong>
            </a>
          </StaggerItem>
        ))}
      </Stagger>
    </SectionReveal>
  )
}
