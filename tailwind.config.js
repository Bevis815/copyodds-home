/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#09090B',
          surface: '#111113',
          elevated: '#18181B',
          border: '#27272A',
          blue: '#f5c542',
          blueSoft: '#f6d97e',
          blueDeep: '#b8891e',
          gold: '#f5c542',
          goldSoft: '#f6d97e',
          goldDeep: '#b8891e',
          text: '#FAFAFA',
          muted: '#A1A1AA',
          profit: '#22C55E',
          loss: '#F87171',
        },
      },
      fontFamily: {
        sans: ['Instrument Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Newsreader', 'Instrument Sans', 'ui-serif', 'Georgia', 'serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        panel: '0 24px 80px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
        blue: '0 0 0 1px rgba(245, 197, 66, 0.22), 0 18px 44px rgba(245, 197, 66, 0.18)',
        glow: '0 20px 60px rgba(0, 0, 0, 0.5)',
      },
    },
  },
}
