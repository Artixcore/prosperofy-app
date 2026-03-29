import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        surface: {
          DEFAULT: "rgb(15 17 21)",
          raised: "rgb(22 25 32)",
          border: "rgb(42 48 60)",
        },
        accent: {
          DEFAULT: "rgb(99 102 241)",
          muted: "rgb(129 140 248)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
