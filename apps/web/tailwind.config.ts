import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/modules/**/*.{js,ts,jsx,tsx,mdx}', // perfil (Épica 2) y reportes (Épica 9)
    './src/shared/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        umss: {
          // Perfil (Épica 2)
          navy: '#2C3B4D',
          ink: '#1B2632',
          cream: '#EEE9DF',
          sand: '#C9C1B1',
          terracotta: '#A35139',
          orange: '#FFB162',
          // Reportes (Épica 9)
          dark: '#1B2632',
          red: '#8B0000',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
