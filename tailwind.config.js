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
          0: '#F5F5F0',   // Warm ivory background
          1: '#FFFFFF',   // Crisp white cards
          2: '#F0EFEA',   // Subtle cream elevated
          3: '#E2E1DA',   // Light border/divider
          dark: '#0F172A',
        },
        brand: {
          black: '#0F172A',
          charcoal: '#334155',
          muted: '#64748B',
        },
        accent: {
          emerald: '#059669',
          gold: '#D97706',
          blue: '#2563EB',
          rose: '#DC2626',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        hard: '4px 4px 0px #0F172A',
        'hard-sm': '2px 2px 0px #0F172A',
        'hard-lg': '6px 6px 0px #0F172A',
        'hard-emerald': '4px 4px 0px #059669',
        'hard-gold': '4px 4px 0px #D97706',
        'hard-blue': '4px 4px 0px #2563EB',
      },
    },
  },
  plugins: [],
};
