/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          bg: '#F7F5F2',
          card: '#FFFFFF',
          'card-alt': '#FBFAF8',
        },
        text: {
          primary: '#33322E',
          muted: '#8A8781',
        },
        accent: {
          stable: '#C9D9C3',
          caution: '#E3B7A5',
          action: '#B8C9E8',
          bonus: '#D9C9E8',
          'stable-dark': '#7BA56E',
          'caution-dark': '#C4806A',
          'action-dark': '#6A8FC4',
          'bonus-dark': '#9B7CC4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
