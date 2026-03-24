import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        secondary: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          500: '#64748b',
          600: '#475569',
        },
        success: {
          50:  '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          50:  '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
        },
        danger: {
          50:  '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
        board: {
          bg:     '#f1f5f9',
          column: '#ffffff',
          card:   '#ffffff',
        },
      },
      boxShadow: {
        card:       '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover':'0 4px 12px rgba(0,0,0,0.1)',
        column:     '0 1px 3px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
};

export default config;
