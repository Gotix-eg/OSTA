import { Plus_Jakarta_Sans, Readex_Pro } from "next/font/google";

// Plus Jakarta Sans: modern, clean, geometric sans-serif for Latin text
export const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"]
});

// Readex Pro: world-class geometric Arabic font that pairs perfectly with geometric sans-serifs
export const serifFont = Readex_Pro({
  subsets: ["arabic", "latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["200", "300", "400", "500", "600", "700"]
});
