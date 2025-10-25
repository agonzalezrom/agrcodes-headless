import type React from "react"
import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

import { ReCaptchaProvider } from "@/components/recaptcha-provider"
import "./globals.css"

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://agr.codes'),
  title: {
    default: "agr.codes - Alejandro González Romero",
    template: "%s - agr.codes",
  },
  description: "Reflexiones sobre desarrollo web, diseño y tecnología por Alejandro González Romero",
  authors: [{ name: "Alejandro González Romero", url: "https://agr.codes" }],
  creator: "Alejandro González Romero",
  publisher: "Alejandro González Romero",
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: "https://agr.codes",
    siteName: "agr.codes",
    title: "agr.codes - Alejandro González Romero",
    description: "Reflexiones sobre desarrollo web, cosmos y tecnología",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "agr.codes - Alejandro González Romero",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "agr.codes - Alejandro González Romero",
    description: "Reflexiones sobre desarrollo web, diseño y tecnología",
    creator: "@agonzalezrom",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={dmSans.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="font-sans antialiased">
        <ReCaptchaProvider>
          {children}
        </ReCaptchaProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
