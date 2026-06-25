/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,vue}"],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        'rice': {
          50: '#FDFBF7',
          100: '#FAF7F2',
          200: '#F5F0E8',
          300: '#EDE5D6',
          400: '#D9CDB8',
        },
        'moss': {
          50: '#E8F0EA',
          100: '#C7DCCB',
          200: '#9CC4A4',
          300: '#6FAB7C',
          400: '#4A7C59',
          500: '#2D5A3D',
          600: '#234730',
          700: '#1A3524',
        },
        'warm': {
          100: '#F0E6D8',
          200: '#E0CCB0',
          300: '#C9A97E',
          400: '#B08B5A',
          500: '#8B7355',
        },
      },
      fontFamily: {
        'hand': ['"Noto Serif SC"', '"ZCOOL XiaoWei"', 'serif'],
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(45, 90, 61, 0.08)',
        'card': '0 8px 30px rgba(0, 0, 0, 0.06)',
        'hover': '0 12px 40px rgba(45, 90, 61, 0.15)',
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'bounce-soft': 'bounce-soft 0.6s ease-in-out',
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
      },
    },
  },
  plugins: [],
};
