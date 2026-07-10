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
        /* ── ONYX: Clear hex tones for max compatibility ── */
        onyx: {
          50:  "#faf9f7",   // Near white warm
          100: "#f3f0ea",   // Soft warm white
          200: "#e0dbd0",   // Light warm gray
          300: "#c5bdb0",   // Medium light gray
          400: "#9e9488",   // Medium warm gray
          500: "#7a7060",   // Neutral warm gray
          600: "#5a5248",   // Dark warm gray
          700: "#3d3830",   // Darker warm brown
          800: "#2a2520",   // Near black warm
          900: "#1a1610",   // Off black warm
          950: "#100e08"    // Deep black warm
        },
        /* ── GOLD: Primary accents ── */
        gold: {
          50:  "#fffde8",
          100: "#fff9c4",
          200: "#fff176",
          300: "#ffe740",
          400: "#f0d020",
          500: "#e8b800", // Primary Gold - slightly darker for contrast
          600: "#c9930a",
          700: "#a67205",
          800: "#7d5204",
          900: "#573803"
        },
        primary: {
          DEFAULT: "#c9930a",          // Vibrant gold
          foreground: "#100e08"        // Dark text on gold
        },
        accent: {
          DEFAULT: "#3b6fd4",          // Deep premium blue
          gold: "#c9930a"              // Vibrant gold
        },
        success: "#22a85a",
        warning: "#d4880a",
        error:   "#d44422",
        /* background / foreground are resolved by CSS vars per breakpoint */
        background: "var(--color-bg)",
        foreground: "var(--color-fg)",
      },
      fontFamily: {
        sans:  ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia"]
      },
      boxShadow: {
        gold:  "0 10px 40px -10px rgba(200, 147, 10, 0.4)",
        onyx:  "0 20px 60px -20px rgba(0, 0, 0, 0.5)",
        glow:  "0 0 30px rgba(200, 147, 10, 0.3)",
      },
      backgroundImage: {
        "onyx-gradient": "linear-gradient(135deg, #1a1610 0%, #100e08 100%)",
        "gold-gradient": "linear-gradient(135deg, #f0bb19 0%, #c9930a 100%)",
        "radial-onyx":   "radial-gradient(circle at center, #2a2520 0%, #100e08 100%)",
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
