import type { Metadata, Viewport } from "next";
import MobileDock from "@/components/MobileDock";
import PwaRegister from "@/components/PwaRegister";
import InstallAppBanner from "@/components/InstallAppBanner";
import FloatingHelpButton from "@/components/FloatingHelpButton";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://varsmartgh.com"),
  title: {
    default: "VarsMart | Campus Student Marketplace & Hostels in Ho, Ghana",
    template: "%s | VarsMart",
  },
  description:
    "VarsMart is Ghana's trusted campus student marketplace in Ho, Volta Region. Find student hostels in Sokode, Dave & Trafalgar, buy & sell textbooks, electronics, food, thrift fashion, and discover campus services.",
  keywords: [
    "VarsMart",
    "varsmartgh",
    "varsmartgh.com",
    "campus marketplace Ghana",
    "student marketplace Ho",
    "UHAS hostels",
    "HTU hostels",
    "student hostels in Ho",
    "hostels in Sokode",
    "hostels in Dave",
    "Trafalgar hostels Ho",
    "cheap student hostels Volta Region",
    "buy textbooks Ho",
    "student electronics Ho",
    "campus food delivery Ho",
    "student business Ghana",
    "thrift fashion campus",
    "student commerce Ghana",
  ],
  authors: [{ name: "VarsMart Ghana", url: "https://varsmartgh.com" }],
  creator: "VarsMart Ghana",
  publisher: "VarsMart",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://varsmartgh.com",
  },
  openGraph: {
    type: "website",
    locale: "en_GH",
    url: "https://varsmartgh.com",
    siteName: "VarsMart Ghana",
    title: "VarsMart | Campus Student Marketplace & Hostels in Ho, Ghana",
    description:
      "Buy, sell, and discover student hostels, gadgets, textbooks, food, and fashion in Ho, Volta Region. Direct WhatsApp and voice call contact with verified student sellers.",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "VarsMart - Campus Student Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VarsMart | Campus Student Marketplace & Hostels in Ho",
    description:
      "The trusted student commerce platform in Ho, Ghana. Discover hostels, textbooks, gadgets, and food deals on campus.",
    images: ["/icon-512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VarsMart",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/icon-192.png",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  verification: {
    google: "yZRe6HPCB793gtjrq9lO1rJVvnXrKbQ32il6mU_Jc4E",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://varsmartgh.com/#website",
      "url": "https://varsmartgh.com",
      "name": "VarsMart",
      "description":
        "Ghana's premier campus student marketplace & hostel accommodation portal in Ho, Volta Region.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://varsmartgh.com/marketplace?query={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://varsmartgh.com/#organization",
      "name": "VarsMart Ghana",
      "url": "https://varsmartgh.com",
      "logo": "https://varsmartgh.com/icon-512.png",
      "sameAs": ["https://varsmartgh.com"],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+233591361005",
        "contactType": "customer service",
        "areaServed": "GH",
        "availableLanguage": ["English", "Ewe", "Twi"],
      },
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://varsmartgh.com/#localbusiness",
      "name": "VarsMart Campus Marketplace",
      "image": "https://varsmartgh.com/icon-512.png",
      "url": "https://varsmartgh.com",
      "telephone": "+233591361005",
      "priceRange": "GH₵",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Ho",
        "addressRegion": "Volta Region",
        "addressCountry": "GH",
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 6.6108,
        "longitude": 0.4786,
      },
    },
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="yZRe6HPCB793gtjrq9lO1rJVvnXrKbQ32il6mU_Jc4E"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="relative min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-700">
        {/* Background Ambient iOS Glows (Non-blocking, behind content) */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div className="ambient-glow-blue absolute -left-20 -top-20 h-96 w-96 rounded-full blur-3xl" />
          <div className="ambient-glow-purple absolute -right-20 top-1/3 h-[28rem] w-[28rem] rounded-full blur-3xl" />
        </div>

        <div className="relative flex min-h-screen flex-col pb-28 md:pb-0">
          {children}
        </div>

        {/* Floating iOS Frosted Glass Mobile Dock */}
        <MobileDock />

        {/* Floating Campus Help & Support Desk */}
        <FloatingHelpButton />

        {/* PWA Service Worker & Install Prompt Banner */}
        <PwaRegister />
        <InstallAppBanner />
      </body>
    </html>
  );
}
