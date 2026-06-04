/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#FFFFFF',
        surface: {
          DEFAULT: '#FBFDFF',
          2: '#F5F8FC',
          3: '#EEF3F9',
        },
        hairline: '#E6ECF3',
        ink: {
          1: '#0B1A33',
          2: '#132036',
          3: '#3A4A66',
          4: '#4F5F77',
          5: '#8A98AE',
        },
        brand: {
          50: '#EEF4FF',
          100: '#D9E6FB',
          300: '#7AA3E8',
          500: '#3A6FD8',
          700: '#1E47A8',
          900: '#0A2461',
          950: '#07152D',
          1000: '#020611',
        },
        leaf: {
          50: '#ECF7F1',
          200: '#BCDFCB',
          400: '#6DB58E',
          600: '#2F8B5C',
          800: '#155538',
        },
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        techno: ["'Eurostile'", "'Microgramma'", "'Bank Gothic'", "'Avenir Next'", 'sans-serif'],
        mono: ["'JetBrains Mono'", "'SF Mono'", 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display': ['clamp(2.6rem, 6vw, 4.6rem)', { lineHeight: '1.0',  letterSpacing: '-0.04em' }],
        'h1':      ['clamp(2.2rem, 4.5vw, 3.6rem)', { lineHeight: '1.08', letterSpacing: '-0.03em' }],
        'h2':      ['clamp(1.85rem, 3.4vw, 3.1rem)', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
        'h3':      ['1.15rem',                       { lineHeight: '1.3',  letterSpacing: '-0.01em' }],
        'lead':    ['clamp(0.95rem, 1.3vw, 1.1rem)', { lineHeight: '1.7',  letterSpacing: '-0.005em' }],
        'eyebrow': ['0.72rem',                       { lineHeight: '1',    letterSpacing: '0.22em' }],
      },
      boxShadow: {
        '1': '0 1px 2px rgba(11, 26, 51, 0.04), 0 1px 1px rgba(11, 26, 51, 0.02)',
        '2': '0 4px 12px rgba(11, 26, 51, 0.06), 0 2px 4px rgba(11, 26, 51, 0.04)',
        '3': '0 12px 32px rgba(11, 26, 51, 0.08), 0 4px 8px rgba(11, 26, 51, 0.04)',
        '4': '0 24px 60px rgba(57, 93, 154, 0.14), 0 38px 90px rgba(73, 134, 117, 0.10)',
        'glow-blue': '0 0 0 1px rgba(58, 111, 216, 0.08), 0 8px 32px rgba(58, 111, 216, 0.12)',
      },
      borderRadius: {
        'card': '1.5rem',
        'plate': '2rem',
      },
      maxWidth: {
        'content': '64rem',
        'wide':    '88rem',
        'bleed':   '1500px',
      },
      transitionTimingFunction: {
        'emphasis': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      backgroundImage: {
        'brand-gradient':   'linear-gradient(90deg, #2F8B5C 0%, #0891b2 100%)',
        'night-card':       'linear-gradient(180deg, #07152d 0%, #0a1f4a 55%, #0c2356 100%)',
        'night-tile':       'linear-gradient(180deg, #0f2659 0%, #0c1f4c 100%)',
        'silver-underline': 'linear-gradient(to right, transparent, #94a3b8, transparent)',
      },
    },
  },
  plugins: [],
}
