import { Link } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { LandingBackdrop } from '../components/landing/LandingBackdrop'
import { IconTelegram } from '../components/ui/Icons'
import { useLocale } from '../hooks/useLocale'
import { useDocumentSeo } from '../hooks/useDocumentSeo'
import { getTelegramSupportHref } from '../lib/support'

const IMG = '/partner-guide'

const OVERVIEW = [
  { key: 'bot', href: '#partner-part-1' },
  { key: 'miniApp', href: '#partner-part-2' },
  { key: 'send', href: '#partner-send' },
]

const PARTNER_ASSETS = `${IMG}`
const LOGO_AVATAR = `${PARTNER_ASSETS}/logo-avatar-512.jpg`
const LOGO_MINIAPP = `${PARTNER_ASSETS}/logo-miniapp-640x360.jpg`

const PART1_STEPS = [
  { key: 'open', image: `${IMG}/image1.jpeg`, highlight: '@BotFather', highlightKind: 'search' },
  { key: 'create', image: `${IMG}/image2.png`, highlight: '/newbot', highlightKind: 'command' },
  { key: 'name', image: `${IMG}/image3.png`, highlight: 'CopyOdds', highlightKind: 'example' },
  { key: 'username', image: `${IMG}/image4.png`, highlight: 'copyodds_demo_bot', highlightKind: 'example' },
  { key: 'token', image: `${IMG}/image5.png`, highlight: '123456789:AAHxxxxxxxxxxxxxxxx', highlightKind: 'token', warn: true },
  { key: 'avatar', image: `${IMG}/image6.jpeg`, highlight: '/setuserpic', highlightKind: 'command' },
  { key: 'setName', image: `${IMG}/image7.jpeg`, highlight: '/setname', highlightKind: 'command' },
  { key: 'privacy', image: null, highlight: '/setprivacy → Disable', highlightKind: 'command', warn: true },
]

const PART2_STEPS = [
  { key: 'create', image: null, highlight: '/newapp', highlightKind: 'command' },
  { key: 'select', image: `${IMG}/image8.png`, highlight: null, highlightKind: null },
  { key: 'info', image: null, highlight: null, highlightKind: null },
  { key: 'url', image: `${IMG}/image9.png`, highlight: null, highlightKind: null },
  { key: 'test', image: `${IMG}/image10.jpeg`, highlight: null, highlightKind: null },
]

const DELIVERABLES = ['token', 'referral']
const TIPS = ['verified', 'username', 'token', 'privacy', 'url']

function InlineCode({ children }) {
  return <code className="partner-guide__code">{children}</code>
}

function GuideFigure({ src, alt, caption }) {
  if (!src) return null
  return (
    <figure className="partner-guide__figure">
      <img className="partner-guide__img" src={src} alt={alt} loading="lazy" decoding="async" />
      {caption ? <figcaption className="partner-guide__figcaption">{caption}</figcaption> : null}
    </figure>
  )
}

function Tip({ children, tone = 'tip' }) {
  return <p className={`partner-guide__callout partner-guide__callout--${tone}`}>{children}</p>
}

function GuideDownloads({ items }) {
  if (!items?.length) return null
  return (
    <div className="partner-guide__downloads">
      {items.map((item) => (
        <a
          key={item.href}
          className="partner-guide__download"
          href={item.href}
          download={item.filename}
        >
          <span className="partner-guide__download-label">{item.label}</span>
          <span className="partner-guide__download-size">{item.size}</span>
        </a>
      ))}
    </div>
  )
}

function GuideStep({
  index,
  title,
  image,
  imageAlt,
  caption,
  highlight,
  highlightLabel,
  children,
  tipKey,
  warn,
}) {
  return (
    <li className={`partner-guide__step ${image ? 'has-image' : ''}`}>
      <span className="partner-guide__step-num" aria-hidden="true">
        {String(index).padStart(2, '0')}
      </span>
      <div className="partner-guide__step-main">
        <div className="partner-guide__step-copy">
          <h3 className="partner-guide__step-title">{title}</h3>
          <div className="partner-guide__step-content">{children}</div>
          {highlight ? (
            <p className="partner-guide__command-row">
              <span className="partner-guide__command-label">{highlightLabel}</span>
              <InlineCode>{highlight}</InlineCode>
            </p>
          ) : null}
          {tipKey ? (
            <Tip tone={warn ? 'warn' : 'tip'}>
              <Trans
                i18nKey={tipKey}
                components={{
                  code: <InlineCode />,
                  strong: <strong />,
                }}
              />
            </Tip>
          ) : null}
        </div>
        <GuideFigure src={image} alt={imageAlt} caption={caption} />
      </div>
    </li>
  )
}

function StepBody({ ns, stepKey }) {
  const { t } = useTranslation()
  const base = `partnerGuide.${ns}.steps.${stepKey}`

  if (stepKey === 'avatar' && ns === 'part1') {
    return (
      <>
        <Trans
          i18nKey={`${base}.body`}
          components={{
            code: <InlineCode />,
            strong: <strong />,
          }}
        />
        <GuideDownloads
          items={[
            {
              href: LOGO_AVATAR,
              filename: 'CopyOdds-avatar-512.jpg',
              label: t(`${base}.downloadAvatar`),
              size: '512 × 512',
            },
          ]}
        />
      </>
    )
  }

  if (stepKey === 'info' && ns === 'part2') {
    return (
      <>
        <p>{t(`${base}.body`)}</p>
        <ul className="partner-guide__field-list">
          <li>
            <span>{t(`${base}.appName`)}</span>
            <InlineCode>CopyOdds</InlineCode>
          </li>
          <li>
            <span>{t(`${base}.shortDesc`)}</span>
            <InlineCode>Copy Trading Platform</InlineCode>
          </li>
        </ul>
        <p className="partner-guide__step-note">{t(`${base}.photoNote`)}</p>
        <GuideDownloads
          items={[
            {
              href: LOGO_MINIAPP,
              filename: 'CopyOdds-miniapp-640x360.jpg',
              label: t(`${base}.downloadCover`),
              size: '640 × 360',
            },
          ]}
        />
      </>
    )
  }

  return (
    <Trans
      i18nKey={`${base}.body`}
      components={{
        code: <InlineCode />,
        strong: <strong />,
      }}
    />
  )
}

export function PartnerGuidePage() {
  const { t } = useTranslation()
  const { localizePath } = useLocale()
  const supportHref = getTelegramSupportHref()
  useDocumentSeo({ page: 'partners' })

  return (
    <div className="landing-page relative min-h-screen w-full">
      <LandingBackdrop />

      <Header logoHref={localizePath('/')} fullWidth compact />

      <main className="relative z-[1] flex w-full flex-col pb-16 pt-6 sm:pb-20 sm:pt-10">
        <div className="landing-shell partner-guide">
          <nav className="partner-guide__crumb" aria-label={t('partnerGuide.breadcrumbAria')}>
            <Link to={localizePath('/')}>{t('common.home')}</Link>
            <span aria-hidden="true">/</span>
            <span>{t('partnerGuide.breadcrumb')}</span>
          </nav>

          <header className="partner-guide__hero">
            <p className="eyebrow">{t('partnerGuide.eyebrow')}</p>
            <h1 className="partner-guide__title">{t('partnerGuide.title')}</h1>
            <p className="partner-guide__subtitle">{t('partnerGuide.subtitle')}</p>
            <div className="partner-guide__meta" aria-label={t('partnerGuide.metaAria')}>
              <span>{t('partnerGuide.meta.time')}</span>
              <span>{t('partnerGuide.meta.tools')}</span>
              <span>{t('partnerGuide.meta.outcome')}</span>
            </div>
          </header>

          <section className="partner-guide__overview" aria-labelledby="partner-overview">
            <div className="partner-guide__overview-head">
              <h2 id="partner-overview" className="partner-guide__part-title">
                {t('partnerGuide.overview.title')}
              </h2>
              <p className="partner-guide__part-body">{t('partnerGuide.overview.body')}</p>
            </div>
            <ol className="partner-guide__overview-grid">
              {OVERVIEW.map((item, index) => (
                <li key={item.key}>
                  <a className="partner-guide__overview-card" href={item.href}>
                    <span className="partner-guide__overview-index">{index + 1}</span>
                    <span className="partner-guide__overview-title">
                      {t(`partnerGuide.overview.items.${item.key}.title`)}
                    </span>
                    <span className="partner-guide__overview-body">
                      {t(`partnerGuide.overview.items.${item.key}.body`)}
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </section>

          <section className="partner-guide__panel" aria-labelledby="partner-part-1">
            <div className="partner-guide__part-head">
              <p className="partner-guide__part-kicker">{t('partnerGuide.part1.kicker')}</p>
              <h2 id="partner-part-1" className="partner-guide__part-title">
                {t('partnerGuide.part1.title')}
              </h2>
              <p className="partner-guide__part-body">{t('partnerGuide.part1.intro')}</p>
            </div>
            <ol className="partner-guide__steps">
              {PART1_STEPS.map((step, i) => (
                <GuideStep
                  key={step.key}
                  index={i + 1}
                  title={t(`partnerGuide.part1.steps.${step.key}.title`)}
                  image={step.image}
                  imageAlt={t(`partnerGuide.part1.steps.${step.key}.imageAlt`)}
                  caption={t(`partnerGuide.part1.steps.${step.key}.caption`)}
                  highlight={step.highlight}
                  highlightLabel={
                    step.highlightKind ? t(`partnerGuide.labels.${step.highlightKind}`) : undefined
                  }
                  tipKey={`partnerGuide.part1.steps.${step.key}.tip`}
                  warn={step.warn}
                >
                  <StepBody ns="part1" stepKey={step.key} />
                </GuideStep>
              ))}
            </ol>
          </section>

          <section className="partner-guide__panel" aria-labelledby="partner-part-2">
            <div className="partner-guide__part-head">
              <p className="partner-guide__part-kicker">{t('partnerGuide.part2.kicker')}</p>
              <h2 id="partner-part-2" className="partner-guide__part-title">
                {t('partnerGuide.part2.title')}
              </h2>
              <p className="partner-guide__part-body">{t('partnerGuide.part2.intro')}</p>
            </div>
            <ol className="partner-guide__steps">
              {PART2_STEPS.map((step, i) => (
                <GuideStep
                  key={step.key}
                  index={i + 1}
                  title={t(`partnerGuide.part2.steps.${step.key}.title`)}
                  image={step.image}
                  imageAlt={
                    step.image ? t(`partnerGuide.part2.steps.${step.key}.imageAlt`) : undefined
                  }
                  caption={step.image ? t(`partnerGuide.part2.steps.${step.key}.caption`) : undefined}
                  highlight={step.highlight}
                  highlightLabel={
                    step.highlightKind ? t(`partnerGuide.labels.${step.highlightKind}`) : undefined
                  }
                  tipKey={`partnerGuide.part2.steps.${step.key}.tip`}
                >
                  <StepBody ns="part2" stepKey={step.key} />
                </GuideStep>
              ))}
            </ol>
          </section>

          <section className="partner-guide__panel partner-guide__panel--cta" aria-labelledby="partner-send">
            <div className="partner-guide__part-head">
              <p className="partner-guide__part-kicker">{t('partnerGuide.send.kicker')}</p>
              <h2 id="partner-send" className="partner-guide__part-title">
                {t('partnerGuide.send.title')}
              </h2>
              <p className="partner-guide__part-body">{t('partnerGuide.send.intro')}</p>
            </div>

            <ul className="partner-guide__deliverables">
              {DELIVERABLES.map((key) => (
                <li key={key} className="partner-guide__deliverable">
                  <strong>{t(`partnerGuide.send.items.${key}.title`)}</strong>
                  <p>{t(`partnerGuide.send.items.${key}.body`)}</p>
                </li>
              ))}
            </ul>

            <p className="partner-guide__note">{t('partnerGuide.send.note')}</p>
            <div className="partner-guide__cta-row">
              <a className="btn-primary partner-guide__support-btn" href={supportHref} target="_blank" rel="noreferrer">
                <IconTelegram className="size-4" />
                {t('partnerGuide.send.cta')}
              </a>
              <p className="partner-guide__cta-hint">{t('partnerGuide.send.ctaHint')}</p>
            </div>
          </section>

          <section className="partner-guide__panel" aria-labelledby="partner-tips">
            <div className="partner-guide__part-head">
              <p className="partner-guide__part-kicker">{t('partnerGuide.tips.kicker')}</p>
              <h2 id="partner-tips" className="partner-guide__part-title">
                {t('partnerGuide.tips.title')}
              </h2>
            </div>
            <ul className="partner-guide__tips">
              {TIPS.map((key) => (
                <li key={key}>
                  <strong>{t(`partnerGuide.tips.items.${key}.title`)}</strong>
                  <p>{t(`partnerGuide.tips.items.${key}.body`)}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>

      <Footer
        fullWidth
        links={[
          { href: localizePath('/'), label: t('common.home') },
          { href: localizePath('/partners'), label: t('partnerGuide.breadcrumb') },
          { href: supportHref, label: 'Telegram', external: true },
        ]}
      />
    </div>
  )
}
