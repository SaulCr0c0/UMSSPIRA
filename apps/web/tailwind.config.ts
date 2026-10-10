import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/shared/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        umss: {
          dark: '#1B2632',
          sand: '#EEE9DF',
          red: '#8B0000',
        },
        palladian: "#EEE9DF",
        oatmeal: "#C9C1B1",
        "blue-fantastic": "#2C3B4D",
        "burning-flame": "#FFB162",
        "truffle-trouble": "#A35139",
        "abyssal-blue": "#1B2632",
        abyssal: "#1B2632",
      },
      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
