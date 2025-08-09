import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./client/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        gold: "#d4af37",
        background: {
          primary: "#0b0b0b",
          secondary: "#111111",
          accent: "rgba(255,255,255,0.02)"
        },
        text: {
          primary: "#ffffff",
          muted: "#aaaaaa",
          gold: "#d4af37"
        },
        border: {
          primary: "rgba(212,175,55,0.12)",
          secondary: "rgba(255,255,255,0.03)"
        }
      },
      fontFamily: {
        sans: ["Tahoma", "Arial", "sans-serif"],
      },
      backgroundImage: {
        'gradient-main': 'linear-gradient(180deg, #050505, #111)',
      },
      boxShadow: {
        'gold': '0 0 18px rgba(212,175,55,0.5)',
      },
      animation: {
        'pulse-gold': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
};

export default config;