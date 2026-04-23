/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ── Sufra Brand Palette ──────────────────────────────────────────────
        // Warm saffron-to-terracotta with deep charcoal — inspired by the
        // colours of a traditional Arab feast table
        saffron: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        terracotta: {
          50:  '#FDF4F0',
          100: '#FAE2D6',
          200: '#F5C0A8',
          300: '#EF987A',
          400: '#E76F4C',
          500: '#C8552E',
          600: '#A63E1F',
          700: '#832E15',
          800: '#60200D',
          900: '#3D1306',
        },
        charcoal: {
          50:  '#F5F4F0',
          100: '#E8E5DC',
          200: '#D0CCC0',
          300: '#B0AB9E',
          400: '#8C877A',
          500: '#6B665A',
          600: '#504C41',
          700: '#38352D',
          800: '#232018',
          900: '#120F09',
        },
        cream: '#FAF6EF',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        arabic:  ['"Noto Naskh Arabic"', 'serif'],
      },
      animation: {
        'counter-up': 'counterUp 0.6s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.7s ease-out forwards',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'shimmer':    'shimmer 2s linear infinite',
      },
      keyframes: {
        counterUp: {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        fadeInUp: {
          from: { opacity: 0, transform: 'translateY(24px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: 1 },
          '50%':      { opacity: 0.7 },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
