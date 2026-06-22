import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { localeNativeLabels, locales } from '../i18n/constants'
import { useLocale } from '../hooks/useLocale'
import { useTranslation } from 'react-i18next'

export function LanguageSwitcher({ className = '' }) {
  const { t } = useTranslation()
  const { locale, setLocale } = useLocale()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const listId = useId()

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) {
      return undefined
    }
    function onPointerDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        close()
      }
    }
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        close()
      }
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, close])

  return (
    <div ref={rootRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        aria-label={t('common.langAria')}
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
        className="interactive-focus flex min-w-[7.5rem] items-center justify-between gap-2 rounded-full border border-[#F5C542]/20 bg-[linear-gradient(165deg,rgba(248,217,120,0.12),rgba(17,22,29,0.92))] px-3 py-1.5 text-[11px] font-medium text-slate-100 shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset] backdrop-blur-sm sm:min-w-[9.5rem] sm:px-3.5 sm:py-2 sm:text-xs"
      >
        <span className="truncate">{localeNativeLabels[locale]}</span>
        <svg
          className={`size-3.5 shrink-0 text-[#F8D978] transition-transform duration-200 sm:size-4 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open ? (
        <div
          className="absolute left-0 right-auto z-[100] mt-1.5 min-w-[11rem] max-w-[min(18rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-white/12 bg-[rgba(11,15,20,0.96)] py-1 shadow-[0_16px_48px_rgba(0,0,0,0.55),0_0_0_1px_rgba(245,197,66,0.08)] backdrop-blur-md sm:left-auto sm:right-0 sm:max-w-none sm:min-w-[12rem] sm:rounded-[20px] sm:py-1.5"
          id={listId}
          role="listbox"
          aria-label={t('common.langAria')}
        >
          {locales.map((code) => {
            const active = code === locale
            return (
              <button
                key={code}
                type="button"
                role="option"
                aria-selected={active}
                className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[12px] font-medium transition sm:px-3.5 sm:py-2.5 sm:text-sm ${
                  active
                    ? 'bg-[#F8D978]/12 text-[#F8D978]'
                    : 'text-slate-200 hover:bg-white/[0.06] hover:text-white'
                }`}
                onClick={() => {
                  setLocale(code)
                  close()
                }}
              >
                <span>{localeNativeLabels[code]}</span>
                {active ? (
                  <svg className="size-3.5 shrink-0 text-[#F8D978]" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
