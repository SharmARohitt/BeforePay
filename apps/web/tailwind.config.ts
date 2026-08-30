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
        bg: "#080808",
        surface: "#0f0f0f",
        "surface-2": "#161616",
        "border-dim": "rgba(255,255,255,0.07)",
        "border-subtle": "rgba(255,255,255,0.12)",
        indigo: {
          DEFAULT: "#6366f1",
          light: "#818cf8",
          dark: "#4f46e5",
          glow: "rgba(99,102,241,0.25)",
        },
        emerald: {
          DEFAULT: "#10b981",
          light: "#34d399",
          glow: "rgba(16,185,129,0.25)",
        },
        amber: {
          DEFAULT: "#f59e0b",
          light: "#fbbf24",
          glow: "rgba(245,158,11,0.25)",
        },
        danger: {
          DEFAULT: "#ef4444",
          light: "#f87171",
          glow: "rgba(239,68,68,0.25)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "'Fira Code'", "Menlo", "monospace"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-in-right": "slideInRight 0.4s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "spin-slow": "spin 8s linear infinite",
        float: "float 4s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        gradient: "gradientShift 8s ease infinite",
        "border-rotate": "borderRotate 4s linear infinite",
        ripple: "ripple 2s linear infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        ripple: {
          "0%": { transform: "scale(0.8)", opacity: "1" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        noise: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        "glow-indigo": "0 0 40px rgba(99,102,241,0.3)",
        "glow-emerald": "0 0 40px rgba(16,185,129,0.3)",
        "glow-amber": "0 0 40px rgba(245,158,11,0.3)",
        "glow-red": "0 0 40px rgba(239,68,68,0.3)",
        "inner-glow": "inset 0 0 20px rgba(99,102,241,0.05)",
        card: "0 1px 0 rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
