// Hard-coded Telegram customer support entrypoint.
// Update this value when the support account changes.
const TELEGRAM_SUPPORT_URL = 'https://t.me/oddsFine'

// WhatsApp username shown in the UI (without @).
const WHATSAPP_SUPPORT_USERNAME = 'olivia2073'

// WhatsApp Click to Chat number (E.164 digits only). Used for the link only — not shown in UI.
const WHATSAPP_SUPPORT_PHONE = '85253326482'

export function getTelegramSupportHref() {
  return TELEGRAM_SUPPORT_URL
}

function normalizeWhatsAppUsername(value) {
  return String(value ?? '')
    .trim()
    .replace(/^@+/, '')
    .replace(/[^\w.]/g, '')
}

function resolveWhatsAppUsername() {
  const fromEnv = normalizeWhatsAppUsername(import.meta.env.VITE_WHATSAPP_SUPPORT_USERNAME)
  if (fromEnv) return fromEnv
  return normalizeWhatsAppUsername(WHATSAPP_SUPPORT_USERNAME)
}

function resolveWhatsAppPhone() {
  const fromEnv = (import.meta.env.VITE_WHATSAPP_SUPPORT_PHONE ?? '').replace(/\D/g, '')
  if (fromEnv) return fromEnv
  return WHATSAPP_SUPPORT_PHONE.replace(/\D/g, '')
}

export function getWhatsAppSupportHandle() {
  const username = resolveWhatsAppUsername()
  return username ? `@${username}` : null
}

export function getWhatsAppSupportHref() {
  const phone = resolveWhatsAppPhone()
  if (!phone) return null
  return `https://wa.me/${phone}`
}

export function isWhatsAppSupportEnabled() {
  return getWhatsAppSupportHref() !== null
}
