import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        gp: {
          rail: "var(--gp-rail)",
          floating: "var(--gp-floating)",
          secondary: "var(--gp-secondary)",
          primary: "var(--gp-primary)",
          elevated: "var(--gp-elevated)",
          brand: "var(--gp-brand)",
          green: "var(--gp-green)",
          yellow: "var(--gp-yellow)",
          red: "var(--gp-red)",
          strong: "var(--gp-text-strong)",
          text: "var(--gp-text)",
          muted: "var(--gp-text-muted)",
          faint: "var(--gp-text-faint)",
          interactive: "var(--gp-interactive)",
        },
        theme: {
          bg: "var(--theme-bg)",
          surface: "var(--theme-surface)",
          card: "var(--theme-card)",
          border: "var(--theme-border)",
          text: "var(--theme-text)",
          muted: "var(--theme-muted)",
          primary: "var(--theme-primary)",
          accent: "var(--theme-accent)",
          glow: "var(--theme-glow)",
        },
        steam: {
          dark: "#171a21",
          blue: "#66c0f4",
          nav: "#1b2838",
        },
      },
      fontFamily: {
        sans: ["Inter", "Noto Sans Thai", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
