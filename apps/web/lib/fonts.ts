import { Cormorant_Garamond, Readex_Pro } from "next/font/google";

export const sansFont = Readex_Pro({
  subsets: ["latin", "arabic"],
  variable: "--font-sans",
  display: "swap"
});

export const serifFont = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["500", "600", "700"]
});
