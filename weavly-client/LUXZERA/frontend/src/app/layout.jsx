import "@/styles/globals.css";
import React, { Suspense } from "react";
import Providers from "@/app/providers";
import AppShell from "@/app/app-shell";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = {
  title: "Weavly",
  description: "Curated designer clothing for men, women, unisex, and kids.",
  icons: {
    icon: [
      { url: "/weavly-favicon.svg?v=17", type: "image/svg+xml" },
      { url: "/favicon-light.png?v=17", media: "(prefers-color-scheme: light)", type: "image/png" },
      { url: "/favicon-dark.png?v=17", media: "(prefers-color-scheme: dark)", type: "image/png" },
      { url: "/favicon-light.png?v=17", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/weavly-favicon.svg?v=17",
    apple: "/apple-touch-icon.png?v=17",
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
        <link
          rel="icon"
          href="/favicon-dark.png?v=17"
          media="(prefers-color-scheme: dark)"
          type="image/png"
        />
        <link
          rel="icon"
          href="/favicon-light.png?v=17"
          media="(prefers-color-scheme: light)"
          type="image/png"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var mql = window.matchMedia('(prefers-color-scheme: dark)');
                  function updateIcon(e) {
                    var link = document.querySelector("link[rel*='icon']:not([type='image/svg+xml'])");
                    if (link) {
                      link.href = e.matches ? '/favicon-dark.png?v=17' : '/favicon-light.png?v=17';
                    }
                  }
                  mql.addEventListener('change', updateIcon);
                } catch(e) {}
              })();
            `,
          }}
        />
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

