import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";
import Header from "./components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.mediamahasangha.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "ODMM - Odisha Digital Media Mahasangha",
    template: "%s | ODMM",
  },

  description: "Odisha Digital Media Mahasangha",

  openGraph: {
    title: "ODMM - Odisha Digital Media Mahasangha",
    description: "Odisha Digital Media Mahasangha",
    url: siteUrl,
    siteName: "ODMM",
    images: [
      {
        url: "/default-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ODMM - Odisha Digital Media Mahasangha",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "ODMM - Odisha Digital Media Mahasangha",
    description: "Odisha Digital Media Mahasangha",
    images: ["/default-og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}