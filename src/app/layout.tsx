import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import "./globals.css";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import FeedbackButton from "@/components/FeedbackButton";
import TrialBanner from "@/components/TrialBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DDC-SSNF — Sistema de Debida Diligencia",
  description:
    "Sistema de debida diligencia para profesionales independientes en Panamá. Cumplimiento Ley 23 de 2015 y guías SSNF.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={esES}>
      <html
        lang="es"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="flex min-h-full flex-col">
          <TrialBanner />
          {children}
          <Footer />
          <CookieConsent />
          <FeedbackButton />
        </body>
      </html>
    </ClerkProvider>
  );
}
