import { Plus_Jakarta_Sans, Readex_Pro, Fraunces } from "next/font/google";

// Plus Jakarta Sans: modern, clean, geometric sans-serif for UI/Body
export const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"]
});

// Fraunces: editorial, premium serif for English display headlines
export const displayFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700", "800", "900"]
});

// Readex Pro: world-class geometric Arabic font that pairs perfectly with geometric sans-serifs
export const serifFont = Readex_Pro({
  subsets: ["arabic", "latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["200", "300", "400", "500", "600", "700"]
});
