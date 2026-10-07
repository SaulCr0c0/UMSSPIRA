import type { Config } from "tailwindcss";

const preset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "var(--brand-primary)",
          "primary-dark": "var(--brand-primary-dark)",
          accent: "var(--brand-accent)",
          secondary: "var(--brand-secondary)",
          background: "var(--brand-background)",
          foreground: "var(--brand-foreground)",
        },
      },
      fontFamily: {
        heading: "var(--font-heading)",
        body: "var(--font-body)",
      },
    },
  },
};

export default preset;
