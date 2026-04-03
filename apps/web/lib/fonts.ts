import { Mirza, Tajawal } from "next/font/google";

// Tajawal: premium Arabic body font - clean, modern, highly legible
export const sansFont = Tajawal({
  subsets: ["arabic", "latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["200", "300", "400", "500", "700", "800", "900"]
});

// Mirza: elegant Arabic calligraphic display font - perfect for headings
export const serifFont = Mirza({
  subsets: ["arabic", "latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "500", "600", "700"]
});
