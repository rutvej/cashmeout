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
          0: '#030712',
          1: '#0a0f1a',
          2: '#111827',
          3: '#1f2937',
        },
        accent: {
          emerald: '#10b981',
          gold: '#F5A623',
          blue: '#3B82F6',
          rose: '#EF4444',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        hard: '4px 4px 0px rgba(0,0,0,0.8)',
        'hard-sm': '2px 2px 0px rgba(0,0,0,0.6)',
        'hard-emerald': '4px 4px 0px rgba(16,185,129,0.3)',
        'hard-gold': '4px 4px 0px rgba(245,166,35,0.3)',
        glow: '0 0 20px rgba(16,185,129,0.15)',
        'glow-gold': '0 0 20px rgba(245,166,35,0.15)',
        'glow-blue': '0 0 20px rgba(59,130,246,0.15)',
      },
    },
  },
  plugins: [],
};
