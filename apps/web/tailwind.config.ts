import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/modules/**/*.{js,ts,jsx,tsx,mdx}', // <-- Crítico para que tome los componentes de reports
  ],
  theme: {
    extend: {
      colors: {
        umss: {
          dark: '#1B2632',
          sand: '#EEE9DF',
          red: '#8B0000',
        },
      },
    },
  },
  plugins: [],
};
export default config;