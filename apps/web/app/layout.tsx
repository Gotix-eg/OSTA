import type { Metadata } from "next";
import type { ReactNode } from "react";

import { serifFont, sansFont, displayFont } from "@/lib/fonts";

import "./globals.css";

export const metadata: Metadata = {
  title: "Ostafy | Skilled Workers Platform",
  description: "Premium bilingual platform connecting Egyptian households with verified skilled workers.",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" }
    ]
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" suppressHydrationWarning className={`${sansFont.variable} ${serifFont.variable} ${displayFont.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
