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
      { url: "/favicon-light.png?v=21", media: "(prefers-color-scheme: light)", type: "image/png" },
      { url: "/favicon-dark.png?v=21", media: "(prefers-color-scheme: dark)", type: "image/png" },
      { url: "/favicon-dark.png?v=21", type: "image/png" },
    ],
    shortcut: "/favicon-dark.png?v=21",
    apple: "/apple-touch-icon.png?v=21",
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function updateThemeFavicon() {
                  try {
                    var isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                    var targetHref = isDark ? '/favicon-dark.png?v=21' : '/favicon-light.png?v=21';
                    
                    var existingLinks = document.querySelectorAll("link[rel*='icon']");
                    var found = false;
                    existingLinks.forEach(function(link) {
                      link.href = targetHref;
                      link.type = 'image/png';
                      link.removeAttribute('media');
                      found = true;
                    });
                    
                    if (!found && document.head) {
                      var newLink = document.createElement('link');
                      newLink.rel = 'icon';
                      newLink.type = 'image/png';
                      newLink.href = targetHref;
                      document.head.appendChild(newLink);
                    }
                  } catch(e) {}
                }
                
                updateThemeFavicon();
                if (window.matchMedia) {
                  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateThemeFavicon);
                }
                document.addEventListener('DOMContentLoaded', updateThemeFavicon);
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

