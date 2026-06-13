import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mind: {
          50:  "#f0f4ff",
          100: "#e0e9ff",
          200: "#c1d3fe",
          300: "#93b3fd",
          400: "#6089fb",
          500: "#3b64f6",
          600: "#2347ec",
          700: "#1b36d9",
          800: "#1c2fb0",
          900: "#1c2d8b",
          950: "#141c5a",
        },
        calm: {
          50:  "#f0fdf9",
          100: "#ccfbef",
          200: "#99f6e0",
          300: "#5ee9cb",
          400: "#2dd4b0",
          500: "#14b89a",
          600: "#0d9078",
          700: "#0f7362",
          800: "#105b4e",
          900: "#114b41",
        },
        warn: {
          50:  "#fff7ed",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
        },
        danger: {
          50:  "#fff1f2",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body:    ["var(--font-body)", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "fade-in":    "fadeIn 0.4s ease-out",
        "slide-up":   "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn:  { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { transform: "translateY(12px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
      },
    },
  },
  plugins: [],
};

export default config;
