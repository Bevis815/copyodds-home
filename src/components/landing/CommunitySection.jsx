import { useTranslation } from 'react-i18next'
import { SITE } from '../../lib/site'
import {
  IconApi,
  IconArrowRight,
  IconBlog,
  IconBook,
  IconDiscord,
  IconGitHub,
  IconTelegram,
  IconX,
} from '../ui/Icons'
import { SectionReveal, Stagger, StaggerItem } from '../ui/Motion'

export function CommunitySection() {
  const { t } = useTranslation()

  const items = [
    {
      key: 'github',
      title: 'GitHub',
      body: t('landing.community.github'),
      href: SITE.github.orgUrl,
      icon: IconGitHub,
      external: true,
    },
    {
      key: 'x',
      title: 'X (Twitter)',
      body: t('landing.community.x'),
      href: SITE.social.x,
      icon: IconX,
      external: true,
    },
    {
      key: 'telegram',
      title: 'Telegram',
      body: t('landing.community.telegram'),
      href: SITE.social.telegram,
      icon: IconTelegram,
      external: true,
    },
    {
      key: 'discord',
      title: 'Discord',
      body: t('landing.community.discord'),
      href: SITE.social.discord || undefined,
      icon: IconDiscord,
      soon: !SITE.social.discord,
    },
    {
      key: 'docs',
      title: t('landing.nav.docs'),
      body: t('landing.community.docs'),
      href: SITE.docs.home,
      icon: IconBook,
      external: true,
    },
    {
      key: 'blog',
      title: t('landing.community.blogTitle'),
      body: t('landing.community.blog'),
      href: SITE.docs.blog,
      icon: IconBlog,
      external: true,
    },
    {
      key: 'api',
      title: t('landing.nav.api'),
      body: t('landing.community.api'),
      href: SITE.docs.api,
      icon: IconApi,
      external: true,
    },
  ]

  return (
    <section className="site-section" id="community">
      <SectionReveal className="site-section__intro">
        <p className="eyebrow">{t('landing.community.eyebrow')}</p>
        <h2 className="site-section__title">{t('landing.community.title')}</h2>
        <p className="site-section__body">{t('landing.community.body')}</p>
      </SectionReveal>

      <Stagger className="community-grid" delay={0.05}>
        {items.map((item) => {
          const Icon = item.icon
          const Tag = item.soon ? 'div' : 'a'
          const linkProps = item.soon
            ? {}
            : {
                href: item.href,
                target: item.external ? '_blank' : undefined,
                rel: item.external ? 'noreferrer' : undefined,
              }

          return (
            <StaggerItem key={item.key}>
              <Tag className={`community-card ${item.soon ? 'is-soon' : ''}`} {...linkProps}>
                <span className="community-card__icon">
                  <Icon className="size-5" />
                </span>
                <h3 className="community-card__title">{item.title}</h3>
                <p className="community-card__body">{item.body}</p>
                <span className="community-card__cta">
                  {item.soon ? t('landing.community.soon') : t('landing.community.join')}
                  {!item.soon ? <IconArrowRight className="size-3.5" /> : null}
                </span>
              </Tag>
            </StaggerItem>
          )
        })}
      </Stagger>
    </section>
  )
}
