import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        /* ── ONYX: Deep Cinematic Black ── */
        onyx: {
          50:  "#F2F2F2",
          100: "#E6E6E6",
          200: "#CCCCCC",
          300: "#B3B3B3",
          400: "#808080",
          500: "#4D4D4D",
          600: "#333333",
          700: "#1A1A1A",
          800: "#0D0D0D",
          900: "#0A0A0B",
          950: "#050506"
        },
        /* ── GOLD: Sahara Luxury Accent ── */
        gold: {
          50:  "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#D4AF37", // Sahara Gold
          600: "#B8860B", // Dark Goldenrod
          700: "#996515", // Golden Brown
          800: "#7A5230",
          900: "#5C3D24"
        },
        /* ── MARBLE: Clean White Surface ── */
        marble: {
          50:  "#FFFFFF",
          100: "#FAFAFA",
          200: "#F5F5F7", // Pure Alabaster
          300: "#EBEBEB"
        },
        primary: {
          DEFAULT: "#D4AF37",
          foreground: "#0A0A0B"
        },
        background: "#0A0A0B",
        foreground: "#F2F2F2",
        success: "#10B981",
        warning: "#F59E0B",
        error:   "#EF4444",
      },
      fontFamily: {
        sans:  ["var(--font-sans)",  "Cairo", "sans-serif"],
        serif: ["var(--font-serif)", "serif"]
      },
      boxShadow: {
        gold:  "0 10px 40px -10px rgba(212, 175, 55, 0.25)",
        onyx:  "0 20px 60px -20px rgba(0, 0, 0, 0.8)",
        glow:  "0 0 20px rgba(212, 175, 55, 0.15)",
      },
      backgroundImage: {
        "onyx-gradient": "linear-gradient(135deg, #1A1A1A 0%, #0A0A0B 100%)",
        "gold-gradient": "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)",
        "radial-onyx": "radial-gradient(circle at center, #1A1A1A 0%, #0A0A0B 100%)",
      },
      keyframes: {
        "gold-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.02)" }
        }
      },
      animation: {
        "gold-pulse": "gold-pulse 4s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
