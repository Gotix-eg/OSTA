import { Inter, Outfit, Readex_Pro } from "next/font/google";

// Inter: premium clean geometric sans-serif for UI/Body
export const sansFont = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: false,
  weight: ["300", "400", "500", "600", "700", "800"]
});

// Outfit: bold, modern, high-end display sans-serif for headlines (Stitch design system)
export const displayFont = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  preload: false,
  weight: ["400", "500", "600", "700", "800", "900"]
});

// Readex Pro: premium geometric Arabic font
export const serifFont = Readex_Pro({
  subsets: ["arabic", "latin"],
  variable: "--font-serif",
  display: "swap",
  preload: false,
  weight: ["200", "300", "400", "500", "600", "700"]
});
