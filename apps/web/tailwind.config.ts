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
        /* ── PRIMARY: Electric Sapphire Blue ── */
        primary: {
          50:  "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
          950: "#172554"
        },
        /* ── ACCENT: Royal Violet ── */
        accent: {
          50:  "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9",
          800: "#5B21B6",
          900: "#4C1D95",
          950: "#2E1065"
        },
        /* ── SUN: Warm Amber Gold ── */
        sun: {
          50:  "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F"
        },
        /* ── DARK: Deep Space Navy ── */
        dark: {
          50:  "#F8FAFF",
          100: "#EEF2FF",
          200: "#E0E7FF",
          300: "#C7D2FE",
          400: "#818CF8",
          500: "#4F46E5",
          600: "#3730A3",
          700: "#1E1B4B",
          800: "#13103A",
          900: "#0D0A2A",
          950: "#06040F"
        },
        /* ── SURFACE: Cool Crystal Glass ── */
        surface: {
          base:  "#F7F9FF",
          soft:  "#EEF2FF",
          sand:  "#E8ECFF",
          mist:  "#FAFBFF",
          peach: "#F0EBFF"
        },
        success: "#10B981",
        warning: "#F59E0B",
        error:   "#EF4444",
        info:    "#3B82F6"
      },
      fontFamily: {
        sans:  ["var(--font-sans)",  "sans-serif"],
        serif: ["var(--font-serif)", "serif"]
      },
      fontSize: {
        hero:  ["3rem",    { lineHeight: "1.08", fontWeight: "800" }],
        h1:    ["2.25rem", { lineHeight: "1.18", fontWeight: "700" }],
        h2:    ["1.875rem",{ lineHeight: "1.28", fontWeight: "700" }],
        h3:    ["1.5rem",  { lineHeight: "1.35", fontWeight: "600" }],
        h4:    ["1.125rem",{ lineHeight: "1.5",  fontWeight: "600" }],
        body:  ["1rem",    { lineHeight: "1.7"  }],
        small: ["0.875rem",{ lineHeight: "1.6"  }],
        xs:    ["0.75rem", { lineHeight: "1.5"  }]
      },
      spacing: {
        "golden-sm":  "0.618rem",
        golden:       "1rem",
        "golden-md":  "1.618rem",
        "golden-lg":  "2.618rem",
        "golden-xl":  "4.236rem",
        "golden-2xl": "6.854rem"
      },
      borderRadius: {
        golden: "0.618rem"
      },
      boxShadow: {
        card:  "0 22px 58px -34px rgba(37, 99, 235, 0.22)",
        glow:  "0 30px 84px -42px rgba(99, 102, 241, 0.45)",
        panel: "0 34px 96px -46px rgba(30, 27, 75, 0.24)",
        soft:  "0 16px 36px -24px rgba(99, 102, 241, 0.18)"
      },
      backgroundImage: {
        lattice:
          "linear-gradient(rgba(99,102,241,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.08) 1px, transparent 1px)",
        halo:
          "radial-gradient(ellipse at top, rgba(99,102,241,0.20), transparent 55%), radial-gradient(ellipse at bottom right, rgba(37,99,235,0.12), transparent 50%)",
        dashboardGlow:
          "radial-gradient(circle at top left, rgba(99,102,241,0.16), transparent 34%), radial-gradient(circle at top right, rgba(139,92,246,0.12), transparent 28%), radial-gradient(circle at bottom left, rgba(37,99,235,0.10), transparent 30%), linear-gradient(135deg, rgba(250,251,255,0.97), rgba(238,242,255,0.98))",
        decoLines:
          "linear-gradient(135deg, rgba(37,99,235,0.14) 0%, rgba(37,99,235,0.14) 1px, transparent 1px, transparent 100%), linear-gradient(45deg, rgba(139,92,246,0.10) 0%, rgba(139,92,246,0.10) 1px, transparent 1px, transparent 100%)"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)"   },
          "50%":      { transform: "translateY(-10px)" }
        },
        pulseLine: {
          "0%, 100%": { opacity: "0.4", transform: "scaleX(0.96)" },
          "50%":      { opacity: "1",   transform: "scaleX(1)"    }
        },
        shimmer: {
          "0%":   { backgroundPosition: "200% 0"  },
          "100%": { backgroundPosition: "-200% 0" }
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)"    }
        }
      },
      animation: {
        float:     "float 5s ease-in-out infinite",
        pulseLine: "pulseLine 3s ease-in-out infinite",
        shimmer:   "shimmer 5s linear infinite",
        slideUp:   "slideUp 0.5s ease-out forwards"
      }
    }
  },
  plugins: []
};

export default config;
