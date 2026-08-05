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
          blue: '#3B82F6',
          blueSoft: '#93C5FD',
          blueDeep: '#1D4ED8',
          gold: '#3B82F6',
          goldSoft: '#93C5FD',
          goldDeep: '#1D4ED8',
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
        blue: '0 0 0 1px rgba(59, 130, 246, 0.22), 0 18px 44px rgba(59, 130, 246, 0.18)',
        glow: '0 20px 60px rgba(0, 0, 0, 0.5)',
      },
    },
  },
}
