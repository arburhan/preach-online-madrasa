import type { Metadata } from "next";
import { Noto_Sans_Bengali, Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import ToastProvider from "@/components/providers/ToastProvider";
import Navbar from "@/components/layout/Navbar";

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
  title: "Online Islamic Academy - ইসলামিক শিক্ষা প্ল্যাটফর্ম",
  description: "বাংলাদেশের সম্পূর্ণ অনলাইন মাদ্রাসা প্ল্যাটফর্ম। কুরআন, হাদিস এবং ইসলামিক শিক্ষা অনলাইনে শিখুন।",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body
        className={`${notoSansBengali.variable} ${inter.variable} font-bengali antialiased`}
      >
        <AuthProvider>
          <Navbar />
          {children}
          <ToastProvider />
        </AuthProvider>
      </body>
    </html>
  );
}
