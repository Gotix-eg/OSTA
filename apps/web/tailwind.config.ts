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
        /* ── ONYX: Dark cinematic tones ── */
        onyx: {
          50:  "oklch(97% 0.005 60)",   // Near white
          100: "oklch(93% 0.005 60)",   // Soft white
          200: "oklch(85% 0.005 60)",   // Light gray
          300: "oklch(72% 0.005 60)",   // Medium light gray
          400: "oklch(58% 0.005 60)",   // Medium gray
          500: "oklch(45% 0.005 60)",   // Neutral gray
          600: "oklch(35% 0.005 60)",   // Dark gray
          700: "oklch(25% 0.005 60)",   // Darker gray
          800: "oklch(18% 0.005 60)",   // Near black
          900: "oklch(13% 0.005 60)",   // Off black
          950: "oklch(9% 0.005 60)"     // Deep black
        },
        /* ── GOLD: Primary accents ── */
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
          DEFAULT: "oklch(65% 0.15 85)",        // Vibrant gold
          foreground: "oklch(10% 0.005 60)"     // Dark text on gold
        },
        accent: {
          DEFAULT: "oklch(50% 0.2 250)",        // Deep premium blue
          gold: "oklch(65% 0.18 85)"            // Vibrant gold
        },
        success: "oklch(55% 0.15 150)",
        warning: "oklch(65% 0.15 75)",
        error:   "oklch(55% 0.2 25)",
        /* background / foreground are resolved by CSS vars per breakpoint */
        background: "var(--color-bg)",
        foreground: "var(--color-fg)",
      },
      fontFamily: {
        sans:  ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia"]
      },
      boxShadow: {
        gold:  "0 10px 40px -10px oklch(55% 0.13 85 / 0.4)",
        onyx:  "0 20px 60px -20px oklch(0% 0 0 / 0.5)",
        glow:  "0 0 30px oklch(65% 0.15 85 / 0.3)",
      },
      backgroundImage: {
        "onyx-gradient": "linear-gradient(135deg, oklch(12% 0.005 60) 0%, oklch(8% 0.005 60) 100%)",
        "gold-gradient": "linear-gradient(135deg, oklch(75% 0.15 85) 0%, oklch(55% 0.13 85) 100%)",
        "radial-onyx":   "radial-gradient(circle at center, oklch(15% 0.005 60) 0%, oklch(8% 0.005 60) 100%)",
      },
      keyframes: {
        "gold-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.02)" }
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        }
      },
      animation: {
        "gold-pulse": "gold-pulse 4s ease-in-out infinite",
        slideUp: "slideUp 0.5s ease-out forwards"
      }
    }
  },
  plugins: []
};

export default config;
