import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        viako: {
          dark:  '#0D0C09',
          olive: '#3A3826',
          gold:  '#C8A96E',
          fog:   '#9B9585',
          cream: '#EDE7D9',
          sand:  '#F4EEE3',
          accent:'#D4573A',
        }
      },
      fontFamily: {
        display: ['var(--font-display)', 'Playfair Display', 'Georgia', 'serif'],
        body:    ['var(--font-body)', 'DM Sans', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #0D0C09 0%, #1a1f16 50%, #0D0C09 100%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease both',
        'pulse-gold': 'pulseGold 2s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(200,169,110,0.4)' },
          '50%':      { boxShadow: '0 0 0 12px rgba(200,169,110,0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
