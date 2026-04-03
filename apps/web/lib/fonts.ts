import { Noto_Sans_Arabic, Tajawal } from "next/font/google";

// Tajawal: clean modern Arabic body font
export const sansFont = Tajawal({
  subsets: ["arabic", "latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["200", "300", "400", "500", "700", "800", "900"]
});

// Noto Sans Arabic: premium display font for headings at weight 800
export const serifFont = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-serif",
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
});
