import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const SHOW_AFTER_PX = 480

function IconArrowUp({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 19V5" />
      <path d="M5 12l7-7 7 7" />
    </svg>
  )
}

function scrollToPageTop() {
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
  window.scrollTo({ top: 0, left: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
}

/**
 * Icon-only back-to-top control. Visible label is only via title / aria (hover tip on desktop).
 * Never render persistent white-on-black caption text.
 */
export function BackToTopButton() {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const label = t('footer.backToTop')

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY || document.documentElement.scrollTop || 0
      setVisible(y > SHOW_AFTER_PX)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      type="button"
      className="back-to-top"
      onClick={scrollToPageTop}
      title={label}
      aria-label={label}
    >
      <IconArrowUp className="size-5" />
    </button>
  )
}
