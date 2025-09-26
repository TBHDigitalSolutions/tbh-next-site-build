// src/app/layout.tsx
import React, { type ReactNode } from "react";
import dynamic from "next/dynamic";

// Providers
import AppProviders from "@/providers/AppProviders";

// Global chrome
import Header from "@/components/global/Header/Header";
import Footer from "@/components/global/Footer/Footer";

// MainContent (the single, global <main>)
import MainContent from "@/components/sections/container/MainContent/MainContent";

// Consent (client only)
{ /* const KlaroConsent = dynamic(
  () => import("@/cookies/privacy/KlaroConsent"),
  { ssr: false, loading: () => null }
); */ } 

// Global styles (order matters)
import "@/styles/unified-theme.css";  // NEW: tokens + shared patterns
import "@/styles/root.css";
import "@/styles/layout.css";
import "@/styles/globals.css";
import "@/styles/packages-unified.module.css";


interface LayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Basic SEO */}
        <meta
          name="description"
          content="TBH Digital Solutions - Transform the way you do business with powerful digital solutions."
        />
        <meta
          name="keywords"
          content="TBH Digital Solutions, Web Development, Digital Marketing, CRM Integration, Content Creation"
        />
        <meta name="author" content="TBH Digital Solutions" />

        {/* Open Graph */}
        <meta property="og:title" content="TBH Digital Solutions" />
        <meta
          property="og:description"
          content="Transform the way you do business with powerful digital solutions."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://tbhdigitalsolutions.com" />
        <meta property="og:image" content="/images/og-image.jpg" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="TBH Digital Solutions" />
        <meta
          name="twitter:description"
          content="Transform the way you do business with powerful digital solutions."
        />
        <meta name="twitter:image" content="/images/twitter-image.jpg" />

        {/* Preloads */}
        <link rel="preload" href="/logos/tbh-logo-primary.svg" as="image" />
        <link
          rel="preload"
          href="/fonts/aldrich/Aldrich-Regular.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/newsreader/Newsreader-Regular.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />

        {/* Brand fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&display=swap"
          rel="stylesheet"
        />

        {/* Favicons */}
        <link rel="icon" href="/favicon_io/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon_io/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon_io/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon_io/apple-touch-icon.png" />
        <link rel="manifest" href="/favicon_io/site.webmanifest" />

        <meta name="theme-color" content="#0EAFFB" />
        <title>TBH Digital Solutions</title>
      </head>

      {/*
        FIXED APP SHELL STRUCTURE:
        - Header (fixed/sticky)
        - MainContent (single <main> with full-width canvas)
        - Footer (sticky bottom)
        - Klaro Consent
        
        Pages (children) should NOT render another <main> - only sections!
      */}
      <body className="app-shell" suppressHydrationWarning>
        <AppProviders>
          {/* Fixed Header */}
          <header className="header-section">
            <Header />
          </header>

          {/* Single Global <main> - Pages render sections inside this */}
          <MainContent>
            {children}
          </MainContent>

          {/* Sticky Footer */}
          <footer className="footer-section">
            <Footer />
          </footer>

          {/* Privacy Consent (client-side only) */}
          { /* <KlaroConsent /> */}
        </AppProviders>
      </body>
    </html>
  );
}