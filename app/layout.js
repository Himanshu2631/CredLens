import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CredLens | AI Spend Audit & Cost Optimization",
  description: "Audit, analyze, and optimize startup AI subscription & API costs. Handcrafted optimization insights for OpenAI, Anthropic, and SaaS tools.",
  keywords: ["AI spend optimization", "SaaS cost auditing", "OpenAI token analytics", "Anthropic cost optimization", "startup runway extension"],
  authors: [{ name: "CredLens Team", url: "https://credlens.com" }],
  creator: "CredLens",
  publisher: "CredLens Inc.",
  metadataBase: new URL("https://credlens.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "CredLens | AI Spend Audit & Cost Optimization",
    description: "Audit, analyze, and optimize startup AI subscription & API costs.",
    url: "https://credlens.com",
    siteName: "CredLens",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CredLens AI Spend Audit Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CredLens | AI Spend Audit & Cost Optimization",
    description: "Audit, analyze, and optimize startup AI subscription & API costs.",
    images: ["/og-image.png"],
    creator: "@credlens",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      style={{ colorScheme: 'dark' }}
    >
      <body className="min-h-full flex flex-col bg-black text-zinc-100 selection:bg-zinc-800 selection:text-white">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-zinc-900 focus:text-white focus:border focus:border-zinc-700 focus:rounded-md focus:outline-none text-xs font-mono"
        >
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" className="flex-1 flex flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
