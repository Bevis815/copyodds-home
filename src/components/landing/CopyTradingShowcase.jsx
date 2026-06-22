import { useTranslation } from 'react-i18next'
import { FeatureSection } from './FeatureSection'

const FEATURE_ICONS = [
  (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="8" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 8V6.5C8 5.1 9.1 4 10.5 4H13.5C14.9 4 16 5.1 16 6.5V8" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 18L10 10L14 14L20 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 18H20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 12H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 3L4 7V11C4 15.4 7.2 19.3 12 20.5C16.8 19.3 20 15.4 20 11V7L12 3Z" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
]

function RiskFeature({ title, body, icon }) {
  return (
    <article className="landing-risk-feature">
      <div className="landing-risk-feature__icon" aria-hidden>
        {icon}
      </div>
      <h3 className="mt-3 text-sm font-semibold text-white sm:text-base">{title}</h3>
      <p className="mt-1.5 text-[13px] leading-6 text-slate-400">{body}</p>
    </article>
  )
}

export function CopyTradingShowcase() {
  const { t } = useTranslation()
  const features = t('landing.copy.features', { returnObjects: true })

  return (
    <FeatureSection
      id="copy-trading"
      eyebrow={t('landing.copy.eyebrow')}
      title={t('landing.copy.title')}
      body={t('landing.copy.body')}
    >
      <div className="landing-showcase-panel landing-showcase-panel--copy">
        <div className="landing-copy-preview">
          <div className="landing-copy-preview__header">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#F8D978]">
                {t('landing.copy.panelKicker')}
              </p>
              <h3 className="mt-1 font-display text-lg font-semibold text-white">AlphaWhale</h3>
            </div>
            <span className="landing-status-pill landing-status-pill--active">{t('landing.copy.statusActive')}</span>
          </div>

          <div className="landing-copy-preview__grid">
            <div className="landing-copy-preview__field">
              <span>{t('landing.copy.maxPositionLabel')}</span>
              <strong>25%</strong>
            </div>
            <div className="landing-copy-preview__field">
              <span>{t('landing.copy.marketCapLabel')}</span>
              <strong>$500</strong>
            </div>
            <div className="landing-copy-preview__field">
              <span>{t('landing.copy.copyLimitLabel')}</span>
              <strong>$2,500</strong>
            </div>
            <div className="landing-copy-preview__field">
              <span>{t('landing.copy.walletLabel')}</span>
              <strong>{t('landing.copy.walletProtected')}</strong>
            </div>
          </div>
        </div>

        <div className="landing-risk-grid">
          {features.map((feature, index) => (
            <RiskFeature
              key={feature.title}
              title={feature.title}
              body={feature.body}
              icon={FEATURE_ICONS[index] ?? FEATURE_ICONS[0]}
            />
          ))}
        </div>
      </div>
    </FeatureSection>
  )
}
