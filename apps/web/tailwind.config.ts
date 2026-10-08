import type { Config } from "tailwindcss";
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/shared/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        umss: {
          navy: '#2C3B4D',
          ink: '#1B2632',
          cream: '#EEE9DF',
          sand: '#C9C1B1',
          terracotta: '#A35139',
          orange: '#FFB162',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  // Sin preflight: el CSS global de dev ya trae su propio reset y no debe cambiar
  corePlugins: { preflight: false },
  plugins: [],
};
export default config;