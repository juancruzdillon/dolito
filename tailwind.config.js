import forms from '@tailwindcss/forms'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Dolito teal — el color distintivo de la marca
        brand: {
          50:  '#F0FDF9',
          100: '#CCFBF0',
          200: '#99F6E0',
          300: '#5EEACC',
          400: '#2DD4B6',
          500: '#0EC6A2',  // ← color primario
          600: '#0AADA0',
          700: '#088A80',
          800: '#096D65',
          900: '#0A5A54',
          950: '#042F2E',
        },
      },
      boxShadow: {
        card:       '0 1px 3px 0 rgb(0 0 0 / .06), 0 1px 2px -1px rgb(0 0 0 / .06)',
        'card-hover': '0 8px 24px -4px rgb(0 0 0 / .12)',
        'dark-card': '0 1px 3px 0 rgb(0 0 0 / .3)',
        'dark-card-hover': '0 8px 24px -4px rgb(0 0 0 / .4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':    'fadeIn 0.3s ease',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [forms],
}
