

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html','./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50:  '#f2f7f0',
          100: '#e0eeda',
          200: '#c2ddb8',
          300: '#96c87a',
          400: '#7aba5a',
          500: '#4e9a2a',
          600: '#3a7a1e',
          700: '#2d6117',
          800: '#1e4210',
          900: '#112509',
        },
        cream: {
          50:  '#fdfcf7',
          100: '#f8f5e8',
          200: '#f0e9cc',
          300: '#e4d5a0',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-up':    'fadeUp 0.7s ease both',
        'fade-in':    'fadeIn 0.5s ease both',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:  { '0%': { opacity: '0', transform: 'translateY(28px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
      },
      boxShadow: {
        'card':       '0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.05)',
        'card-hover': '0 12px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        'glow':       '0 0 40px rgba(78,154,42,0.3)',
      },
    },
  },
  plugins: [],
};
