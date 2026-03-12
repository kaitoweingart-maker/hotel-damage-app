/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FBE8E8',
          100: '#F4CCCC',
          200: '#E89A9A',
          300: '#D96B6B',
          400: '#C94444',
          500: '#B22D2D',
          600: '#962424',
          700: '#7A1A1A',
          800: '#5C1111',
          900: '#3D0A0A',
        }
      }
    }
  },
  plugins: []
};
