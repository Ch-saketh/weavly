import "@/styles/globals.css";
import React, { Suspense } from "react";
import Providers from "@/app/providers";
import AppShell from "@/app/app-shell";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = {
  title: "Weavly",
  description: "Curated designer clothing for men, women, unisex, and kids.",
  icons: {
    icon: "/logo.png?v=3",
    shortcut: "/logo.png?v=3",
    apple: "/logo.png?v=3",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="referrer" content="no-referrer" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Mochiy+Pop+One&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased text-[#183B56] bg-[#F5EFEB]">
        <Providers>
          <Suspense fallback={null}>
            <AppShell>{children}</AppShell>
          </Suspense>
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}

