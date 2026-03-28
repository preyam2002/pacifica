import type { Metadata } from "next"
import { Syne, Geist_Mono, DM_Sans } from "next/font/google"
import { Providers } from "@/components/providers"
import { Navbar } from "@/components/navbar"
import { MobileNav } from "@/components/mobile-nav"
import "./globals.css"

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const syne = Syne({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "Pacifica - Play-Money Prediction Markets",
    template: "%s | Pacifica",
  },
  description:
    "Create and trade on prediction markets with play money. Compete with friends, sync real markets from Polymarket & Kalshi, and prove you can beat the crowd.",
  openGraph: {
    siteName: "Pacifica",
    type: "website",
  },
  twitter: {
    card: "summary",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${syne.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="noise flex min-h-full flex-col">
        <Providers>
          <Navbar />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-20 pt-6 md:pb-6">
            {children}
          </main>
          <MobileNav />
        </Providers>
      </body>
    </html>
  )
}
