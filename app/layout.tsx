import type { Metadata } from "next";
import { Noto_Sans_Bengali, Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import ToastProvider from "@/components/providers/ToastProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TawkChat from "@/components/TawkChat";
import { OrganizationJsonLd } from "@/components/seo/JsonLd";
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  defaultOpenGraph,
  defaultTwitter,
  seoUrl,
} from "@/lib/seo";

const notoSansBengali = Noto_Sans_Bengali({
  variable: "--font-bengali",
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - ইসলামিক শিক্ষা প্ল্যাটফর্ম`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "ইসলামিক শিক্ষা",
    "অনলাইন একাডেমি",
    "কুরআন শিক্ষা",
    "হাদিস শিক্ষা",
    "ইসলামিক কোর্স",
    "অনলাইন ইসলামিক একাডেমি",
    "বাংলাদেশ মাদ্রাসা",
    "Islamic education",
    "online madrasa",
    "Quran learning",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    ...defaultOpenGraph,
    title: `${SITE_NAME} - ইসলামিক শিক্ষা প্ল্যাটফর্ম`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: defaultTwitter,
  alternates: {
    canonical: seoUrl("/"),
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
  // Add your Google/Bing verification codes here after setting up search consoles
  // verification: {
  //   google: 'your-google-verification-code',
  //   other: {
  //     'msvalidate.01': 'your-bing-verification-code',
  //   },
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body
        className={`${notoSansBengali.variable} ${inter.variable} font-bengali antialiased min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <ToastProvider />
          <TawkChat />
        </AuthProvider>
        <OrganizationJsonLd />
      </body>
    </html>
  );
}
