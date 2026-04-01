import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "../../packages/shared/src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#FFF6F4",
          100: "#FCE8E3",
          200: "#F6CDC2",
          300: "#E7A697",
          400: "#D47A67",
          500: "#B85346",
          600: "#963B35",
          700: "#7B2D2F",
          800: "#632628",
          900: "#4A1C21",
          950: "#2B0D12"
        },
        accent: {
          50: "#EDF8F7",
          100: "#D5EFEC",
          200: "#A9DDD8",
          300: "#7AC7C0",
          400: "#49ADA5",
          500: "#2E8C89",
          600: "#206F70",
          700: "#17585A",
          800: "#154749",
          900: "#133B3D",
          950: "#0A2224"
        },
        sun: {
          50: "#FFF9EC",
          100: "#F9EAC0",
          200: "#F0D68C",
          300: "#E0BB56",
          400: "#CEA03B",
          500: "#B88727",
          600: "#966D20",
          700: "#79571E",
          800: "#63471C",
          900: "#533B1B"
        },
        dark: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
          950: "#020617"
        },
        surface: {
          base: "#F7F0E4",
          soft: "#F1E6D6",
          sand: "#D8C7AE",
          mist: "#FBF8F2",
          peach: "#F3DDD1"
        },
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        serif: ["var(--font-serif)", "serif"]
      },
      fontSize: {
        hero: ["3rem", { lineHeight: "1.1", fontWeight: "800" }],
        h1: ["2.25rem", { lineHeight: "1.2", fontWeight: "700" }],
        h2: ["1.875rem", { lineHeight: "1.3", fontWeight: "700" }],
        h3: ["1.5rem", { lineHeight: "1.35", fontWeight: "600" }],
        h4: ["1.125rem", { lineHeight: "1.5", fontWeight: "600" }],
        body: ["1rem", { lineHeight: "1.7" }],
        small: ["0.875rem", { lineHeight: "1.6" }],
        xs: ["0.75rem", { lineHeight: "1.5" }]
      },
      spacing: {
        "golden-sm": "0.618rem",
        golden: "1rem",
        "golden-md": "1.618rem",
        "golden-lg": "2.618rem",
        "golden-xl": "4.236rem",
        "golden-2xl": "6.854rem"
      },
      borderRadius: {
        golden: "0.618rem"
      },
      boxShadow: {
        card: "0 22px 58px -34px rgba(43, 13, 18, 0.22)",
        glow: "0 30px 84px -42px rgba(123, 45, 47, 0.38)",
        panel: "0 34px 96px -46px rgba(31, 23, 18, 0.22)",
        soft: "0 16px 36px -24px rgba(61, 42, 26, 0.16)"
      },
      backgroundImage: {
        lattice:
          "linear-gradient(rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px)",
        halo:
          "radial-gradient(circle at top, rgba(220,38,38,0.16), transparent 55%), radial-gradient(circle at bottom right, rgba(15,23,42,0.14), transparent 45%)",
        dashboardGlow:
          "radial-gradient(circle at top left, rgba(123,45,47,0.22), transparent 34%), radial-gradient(circle at top right, rgba(46,140,137,0.18), transparent 28%), radial-gradient(circle at bottom left, rgba(184,135,39,0.14), transparent 30%), linear-gradient(135deg, rgba(255,252,247,0.96), rgba(247,240,228,0.98))",
        decoLines:
          "linear-gradient(135deg, rgba(184,135,39,0.16) 0%, rgba(184,135,39,0.16) 1px, transparent 1px, transparent 100%), linear-gradient(45deg, rgba(46,140,137,0.1) 0%, rgba(46,140,137,0.1) 1px, transparent 1px, transparent 100%)"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        pulseLine: {
          "0%, 100%": { opacity: "0.4", transform: "scaleX(0.96)" },
          "50%": { opacity: "1", transform: "scaleX(1)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" }
        }
      },
      animation: {
        float: "float 5s ease-in-out infinite",
        pulseLine: "pulseLine 3s ease-in-out infinite",
        shimmer: "shimmer 5s linear infinite"
      }
    }
  },
  plugins: []
};

export default config;
