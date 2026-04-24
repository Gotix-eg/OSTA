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
        /* ── ONYX: Deep Cinematic Black (Tinted with Gold) ── */
        onyx: {
          50:  "oklch(97% 0.01 60)",
          100: "oklch(90% 0.01 60)",
          200: "oklch(80% 0.01 60)",
          300: "oklch(70% 0.01 60)",
          400: "oklch(60% 0.01 60)",
          500: "oklch(50% 0.01 60)",
          600: "oklch(40% 0.01 60)",
          700: "oklch(30% 0.01 60)",
          800: "oklch(20% 0.01 60)",
          900: "oklch(14% 0.01 60)", // Deep tinted charcoal
          950: "oklch(10% 0.01 60)"  // Near black tinted
        },
        /* ── GOLD: Sahara Luxury Accent ── */
        gold: {
          50:  "oklch(98% 0.02 85)",
          100: "oklch(95% 0.04 85)",
          200: "oklch(90% 0.08 85)",
          300: "oklch(85% 0.12 85)",
          400: "oklch(80% 0.16 85)",
          500: "oklch(75% 0.15 85)", // Primary Gold
          600: "oklch(65% 0.14 85)",
          700: "oklch(55% 0.13 85)",
          800: "oklch(45% 0.11 85)",
          900: "oklch(35% 0.09 85)"
        },
        primary: {
          DEFAULT: "oklch(75% 0.15 85)",
          foreground: "oklch(10% 0.01 60)"
        },
        accent: {
          DEFAULT: "oklch(70% 0.2 250)", // Premium Blue
          gold: "oklch(85% 0.18 95)"     // Vibrant Gold
        },
        success: "oklch(75% 0.15 150)",
        warning: "oklch(80% 0.15 75)",
        error:   "oklch(65% 0.2 25)",
        background: "oklch(12% 0.01 60)",
        foreground: "oklch(95% 0.01 60)",
      },
      fontFamily: {
        sans:  ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia"]
      },
      boxShadow: {
        gold:  "0 10px 40px -10px oklch(75% 0.15 85 / 0.25)",
        onyx:  "0 20px 60px -20px oklch(10% 0.01 60 / 0.8)",
        glow:  "0 0 20px oklch(75% 0.15 85 / 0.15)",
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
