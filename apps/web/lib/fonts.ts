import { Fraunces, Readex_Pro } from "next/font/google";

// Readex Pro: excellent Arabic + Latin support, modern geometric feel
export const sansFont = Readex_Pro({
  subsets: ["latin", "arabic"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"]
});

// Fraunces: ultra-premium optical serif — perfect for hero headlines
export const serifFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"]
});
