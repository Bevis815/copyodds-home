// Hard-coded Telegram customer support entrypoint.
// Update this value when the support account changes.
const TELEGRAM_SUPPORT_URL = 'https://t.me/bevis815'

// WhatsApp customer support (E.164 digits only, no + or spaces).
const WHATSAPP_SUPPORT_PHONE = '8613427442130'

export function getTelegramSupportHref() {
  return TELEGRAM_SUPPORT_URL
}

function resolveWhatsAppPhone() {
  const fromEnv = (import.meta.env.VITE_WHATSAPP_SUPPORT_PHONE ?? '').replace(/\D/g, '')
  if (fromEnv) return fromEnv
  return WHATSAPP_SUPPORT_PHONE.replace(/\D/g, '')
}

export function getWhatsAppSupportHref() {
  const phone = resolveWhatsAppPhone()
  if (!phone) return null
  return `https://wa.me/${phone}`
}

export function isWhatsAppSupportEnabled() {
  return getWhatsAppSupportHref() !== null
}
