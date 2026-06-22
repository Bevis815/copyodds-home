import { useTranslation } from 'react-i18next'
import {
  getTelegramSupportHref,
  getWhatsAppSupportHref,
  isWhatsAppSupportEnabled,
} from '../lib/support'

function MessageCircleIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  )
}

function WhatsAppIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  )
}

function ExternalSupportLink({ href, className, children, ariaLabel }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </a>
  )
}

export function SupportHeaderButton() {
  const { t } = useTranslation()
  const href = getTelegramSupportHref()

  return (
    <ExternalSupportLink
      href={href}
      ariaLabel={t('support.floatingAria')}
      className="interactive-focus btn-gold inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
    >
      <MessageCircleIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      <span className="hidden min-[420px]:inline">{t('support.telegram')}</span>
      <span className="min-[420px]:hidden">{t('support.title')}</span>
    </ExternalSupportLink>
  )
}

export function SupportFooterLink() {
  const { t } = useTranslation()
  const href = getTelegramSupportHref()

  return (
    <ExternalSupportLink
      href={href}
      ariaLabel={t('support.floatingAria')}
      className="interactive-focus inline-flex items-center gap-1.5 rounded-full border border-[#F5C542]/20 bg-[#F5C542]/8 px-3 py-1.5 text-xs font-semibold text-[#F6D97E] transition hover:border-[#F5C542]/32 hover:bg-[#F5C542]/12 sm:px-4 sm:py-2 sm:text-sm"
    >
      <MessageCircleIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      {t('support.telegram')}
    </ExternalSupportLink>
  )
}

export function SupportContactPanel({ className = '' }) {
  const { t } = useTranslation()
  const telegramHref = getTelegramSupportHref()
  const whatsAppHref = getWhatsAppSupportHref()
  const whatsAppEnabled = isWhatsAppSupportEnabled()

  return (
    <div className={`mt-6 grid gap-3 sm:grid-cols-2 ${className}`.trim()}>
      <ExternalSupportLink
        href={telegramHref}
        ariaLabel={t('support.floatingAria')}
        className="interactive-focus surface-card flex items-center justify-between gap-3 rounded-2xl border border-[#F5C542]/16 px-4 py-4 transition hover:border-[#F5C542]/28 hover:bg-[#F5C542]/[0.04] sm:px-5 sm:py-5"
      >
        <span className="inline-flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#F5C542]/20 bg-[#F5C542]/10 text-[#F6D97E]">
            <MessageCircleIcon className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-white">{t('support.telegram')}</span>
            <span className="mt-0.5 block truncate text-xs text-slate-500">{t('support.panelHint')}</span>
          </span>
        </span>
        <span className="btn-gold shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold sm:px-4 sm:py-2 sm:text-sm">
          {t('support.telegramCta')}
        </span>
      </ExternalSupportLink>

      {whatsAppEnabled && whatsAppHref ? (
        <ExternalSupportLink
          href={whatsAppHref}
          ariaLabel={t('support.whatsappFloatingAria')}
          className="interactive-focus surface-card flex items-center justify-between gap-3 rounded-2xl border border-white/8 px-4 py-4 transition hover:border-white/14 hover:bg-white/[0.03] sm:px-5 sm:py-5"
        >
          <span className="inline-flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[#25D366]">
              <WhatsAppIcon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-white">{t('support.whatsapp')}</span>
              <span className="mt-0.5 block truncate text-xs text-slate-500">{t('support.panelHint')}</span>
            </span>
          </span>
          <span className="btn-ghost shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold sm:px-4 sm:py-2 sm:text-sm">
            {t('support.whatsappCta')}
          </span>
        </ExternalSupportLink>
      ) : null}
    </div>
  )
}

export function SupportFloatingButton() {
  const { t } = useTranslation()
  const href = getTelegramSupportHref()

  return (
    <ExternalSupportLink
      href={href}
      ariaLabel={t('support.floatingAria')}
      className="interactive-focus fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full border border-[#F5C542]/24 bg-[linear-gradient(135deg,#f8d978_0%,#f5c542_42%,#b8891e_100%)] px-4 py-3 text-sm font-semibold text-[#111318] shadow-[0_16px_40px_rgba(245,197,66,0.28),0_0_24px_rgba(245,197,66,0.12)] transition hover:-translate-y-0.5 hover:brightness-[1.04] sm:bottom-6 sm:right-6 sm:px-5 sm:py-3.5"
    >
      <MessageCircleIcon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
      <span>{t('support.telegram')}</span>
    </ExternalSupportLink>
  )
}
