/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#e9eef5',
          light: '#f5f8fc',
          dark: '#dfe5ee',
        },
        ink: {
          DEFAULT: '#1e293b',
          soft: '#475569',
        },
        muted: '#64748b',
        amber: {
          DEFAULT: '#f59e0b',
          soft: '#fef3c7',
          deep: '#d97706',
        },
        leaf: '#059669',
        rust: '#dc2626',
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        neu: '8px 8px 18px rgba(163, 177, 198, 0.45), -8px -8px 18px rgba(255, 255, 255, 0.9)',
        'neu-sm': '4px 4px 10px rgba(163, 177, 198, 0.4), -4px -4px 10px rgba(255, 255, 255, 0.9)',
        'neu-xs': '2px 2px 5px rgba(163, 177, 198, 0.35), -2px -2px 5px rgba(255, 255, 255, 0.9)',
        'neu-inset': 'inset 3px 3px 6px rgba(163, 177, 198, 0.45), inset -3px -3px 6px rgba(255, 255, 255, 0.9)',
        'neu-inset-sm': 'inset 2px 2px 4px rgba(163, 177, 198, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.9)',
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
        'glass-lg': '0 12px 40px 0 rgba(31, 38, 135, 0.12)',
      },
      borderRadius: {
        neu: '20px',
        'neu-sm': '14px',
        'neu-lg': '26px',
      },
    },
  },
  plugins: [],
}
