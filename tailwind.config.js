/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0B0F14',
          surface: '#11161D',
          elevated: '#161C24',
          border: '#27303B',
          gold: '#F5C542',
          goldSoft: '#F8D978',
          goldDeep: '#B8891E',
          text: '#F6F7F9',
          muted: '#8E98A8',
          profit: '#22C55E',
          loss: '#F87171',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        panel:
          '0 24px 80px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
        gold: '0 0 0 1px rgba(245, 197, 66, 0.22), 0 18px 44px rgba(245, 197, 66, 0.18)',
        glow: '0 20px 60px rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: {
        'gold-radial':
          'radial-gradient(circle at center, rgba(245, 197, 66, 0.24), transparent 70%)',
        'panel-gradient':
          'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
      },
    },
  },
}
