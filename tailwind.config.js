/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Segoe UI', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        ap: {
          blue:       '#003A70',
          'blue-mid': '#005FAD',
          'blue-light':'#E8F1FA',
          gold:       '#F5A623',
          'gold-light':'#FEF3DC',
          green:      '#1A7A4A',
          'green-light':'#E6F5EE',
          red:        '#C0392B',
          'red-light':'#FDECEA',
          orange:     '#E67E22',
          'orange-light':'#FEF0E6',
          gray: {
            50:  '#F7F8FA',
            100: '#EEF0F3',
            200: '#D8DBE2',
            400: '#9EA7B8',
            600: '#5C6880',
            800: '#2C3349',
          },
        },
        primary: {
          50:'#F0F4FF', 100:'#E0E9FF', 200:'#C7D7FE', 300:'#A4BCFC',
          400:'#8098F9', 500:'#6172F3', 600:'#4C54E8', 700:'#3D3FD4',
          800:'#3436AB', 900:'#2F3187',
        },
        success: { 50:'#F0FDF4', 100:'#DCFCE7', 500:'#22C55E', 600:'#16A34A', 700:'#15803D' },
        warning: { 50:'#FFFBEB', 100:'#FEF3C7', 500:'#F59E0B', 600:'#D97706', 700:'#B45309' },
        danger:  { 50:'#FEF2F2', 100:'#FEE2E2', 500:'#EF4444', 600:'#DC2626', 700:'#B91C1C' },
        neutral: {
          50:'#F9FAFB', 100:'#F3F4F6', 200:'#E5E7EB', 300:'#D1D5DB',
          400:'#9CA3AF', 500:'#6B7280', 600:'#4B5563', 700:'#374151',
          800:'#1F2937', 900:'#111827',
        },
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,58,112,0.08),0 1px 2px rgba(0,0,0,0.04)',
        md: '0 4px 12px rgba(0,58,112,0.10),0 2px 4px rgba(0,0,0,0.05)',
        lg: '0 8px 32px rgba(0,58,112,0.14),0 4px 8px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
};
