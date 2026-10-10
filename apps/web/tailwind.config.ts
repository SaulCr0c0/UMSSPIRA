import type { Config } from 'tailwindcss'
import identidad from './src/shared/identidad/tailwind-preset'

const config: Config = {
  presets: [identidad],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        umss: {
          navy: '#1E293B',
          navydark: '#0F172A',
          orange: '#FFB162',
          brick: '#A34739',
          cream: '#FDFBF7',
          light: '#F5F5F5',
          dark: '#111827',
        },
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
        poppins: ['var(--font-poppins)', 'sans-serif'],
      },
      boxShadow: {
        umss: '0 4px 14px 0 rgba(30, 41, 59, 0.10)',
        'umss-lg': '0 10px 30px 0 rgba(30, 41, 59, 0.15)',
      },
    },
  },
  plugins: [],
}
export default config
