/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf4',
          100: '#d1fae5',
          600: '#059669',
          700: '#047857',
          900: '#064e3b'
        }
      },
      boxShadow: {
        card: '0 10px 30px rgba(2, 6, 23, 0.08)'
      }
    }
  },
  plugins: []
};
