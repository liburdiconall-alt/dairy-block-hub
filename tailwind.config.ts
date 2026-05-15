import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'db-black':      '#1A1A1A',
        'db-white':      '#FFFFFF',
        'db-mint':       '#C4DBCB',
        'db-mint-light': '#E8F2EC',
        'db-mint-dark':  '#9BBFAB',
        'db-orange':     '#E67C36',
        'db-marigold':   '#F2A53F',
        'db-teal':       '#29967F',
        'db-teal-dark':  '#1E7060',
        'db-red':        '#F64741',
        'db-gray': {
          50:  '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      fontFamily: {
        display: ['var(--font-syne)', 'sans-serif'],
        serif:   ['var(--font-playfair)', 'serif'],
        sans:    ['var(--font-inter)', 'sans-serif'],
        script:  ['var(--font-dancing)', 'cursive'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      backgroundImage: {
        'db-gradient':   'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)',
        'mint-gradient': 'linear-gradient(135deg, #C4DBCB 0%, #E8F2EC 100%)',
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease-in-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
      },
      boxShadow: {
        card:        '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06)',
        'card-hover':'0 4px 12px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.08)',
        emergency:   '0 0 0 3px rgba(246,71,65,0.2)',
      },
    },
  },
  plugins: [],
}

export default config
