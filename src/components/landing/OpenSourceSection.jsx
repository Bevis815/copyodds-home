import { useTranslation } from 'react-i18next'
import { SITE } from '../../lib/site'
import { useGitHubStats } from '../../hooks/useGitHubStats'
import { formatRelativeTime } from '../../utils/format'
import { IconArrowRight, IconGitHub } from '../ui/Icons'
import { SectionReveal, Stagger, StaggerItem } from '../ui/Motion'

const PILLARS = [
  'license',
  'openDev',
  'contributions',
  'issues',
  'prs',
  'roadmap',
  'releases',
  'activity',
]

export function OpenSourceSection() {
  const { t } = useTranslation()
  const { stats } = useGitHubStats()
  const commits = stats.recentCommits?.length
    ? stats.recentCommits
    : [
        {
          sha: '—',
          message: t('landing.openSource.commitPlaceholder'),
          author: 'CopyOdds',
          date: null,
          url: SITE.github.web.url,
        },
      ]

  const contributors = stats.contributors || 0

  return (
    <section className="site-section" id="opensource">
      <SectionReveal className="site-section__intro">
        <p className="eyebrow">{t('landing.openSource.eyebrow')}</p>
        <h2 className="site-section__title">{t('landing.openSource.title')}</h2>
        <p className="site-section__body">{t('landing.openSource.body')}</p>
      </SectionReveal>

      <Stagger className="os-pillars" delay={0.04}>
        {PILLARS.map((key) => (
          <StaggerItem key={key}>
            <div className="os-pillar">
              <h3>{t(`landing.openSource.pillars.${key}.title`)}</h3>
              <p>{t(`landing.openSource.pillars.${key}.body`)}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="os-activity">
        <SectionReveal className="os-activity__panel" delay={0.05}>
          <div className="os-activity__head">
            <h3>{t('landing.openSource.recentCommits')}</h3>
            <a className="text-link" href={SITE.github.web.url} target="_blank" rel="noreferrer">
              {t('landing.openSource.viewRepo')} <IconArrowRight className="size-3.5" />
            </a>
          </div>
          <ul className="os-commits">
            {commits.map((commit, index) => (
              <li key={`${commit.sha}-${index}`}>
                <a href={commit.url} target="_blank" rel="noreferrer">
                  <code>{commit.sha}</code>
                  <span className="os-commits__msg">{commit.message}</span>
                  <span className="os-commits__meta">
                    {commit.author}
                    {commit.date ? ` · ${formatRelativeTime(commit.date)}` : ''}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </SectionReveal>

        <Stagger className="os-activity__side" delay={0.1}>
          <StaggerItem>
            <a
              className="os-side-card"
              href={stats.latestRelease?.url || SITE.docs.releases}
              target="_blank"
              rel="noreferrer"
            >
              <span className="os-side-card__label">{t('landing.openSource.latestRelease')}</span>
              <strong>{stats.latestRelease?.tag || t('landing.stats.releaseSoon')}</strong>
              <span className="os-side-card__hint">
                {stats.latestRelease?.name || t('landing.openSource.releaseHint')}
              </span>
            </a>
          </StaggerItem>
          <StaggerItem>
            <a
              className="os-side-card"
              href={`${SITE.github.web.url}/graphs/contributors`}
              target="_blank"
              rel="noreferrer"
            >
              <span className="os-side-card__label">{t('landing.openSource.contributors')}</span>
              <strong>{contributors || '—'}</strong>
              <span className="os-side-card__hint">{t('landing.openSource.contributorsHint')}</span>
            </a>
          </StaggerItem>
          <StaggerItem>
            <div className="os-side-card os-side-card--repos">
              <span className="os-side-card__label">{t('landing.openSource.repos')}</span>
              <a href={SITE.github.web.url} target="_blank" rel="noreferrer">
                <IconGitHub className="size-4" />
                copyodds-web
              </a>
              <a href={SITE.github.services.url} target="_blank" rel="noreferrer">
                <IconGitHub className="size-4" />
                copyodds-services
              </a>
            </div>
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  )
}
