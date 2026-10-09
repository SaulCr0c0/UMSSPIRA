import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        umss: {
          navy: '#1E3A5F',
          orange: '#E8503A',
          cream: '#F5F0E8',
          light: '#F5F5F5',
          dark: '#1A1A2E',
        },
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
        poppins: ['var(--font-poppins)', 'sans-serif'],
      },
      boxShadow: {
        umss: '0 4px 14px 0 rgba(30, 58, 95, 0.10)',
        'umss-lg': '0 10px 30px 0 rgba(30, 58, 95, 0.15)',
      },
    },
  },
  plugins: [],
}
export default config