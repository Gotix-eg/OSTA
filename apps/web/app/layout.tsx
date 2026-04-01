import type { Metadata } from "next";
import type { ReactNode } from "react";

import { serifFont, sansFont } from "@/lib/fonts";

import "./globals.css";

export const metadata: Metadata = {
  title: "OSTA | Skilled Workers Platform",
  description: "Premium bilingual platform connecting Egyptian households with verified skilled workers."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" suppressHydrationWarning className={`${sansFont.variable} ${serifFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
