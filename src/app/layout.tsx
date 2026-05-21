import {Suspense} from "react"
import type {Metadata} from "next"
import {Geist, Geist_Mono} from "next/font/google"
import {SpeedInsights} from "@vercel/speed-insights/next"
import {Analytics} from "@vercel/analytics/next"

import {ReCaptchaProvider} from "@/components/recaptcha-provider"
import "./globals.css"

const geistSans = Geist({
    subsets: ["latin"],
    variable: "--font-geist-sans",
    display: "swap",
})

const geistMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-geist-mono",
    display: "swap",
})

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://agrcodes.com'),
    title: {
        default: "agrcodes.com - Alejandro González Romero",
        template: "%s - agrcodes.com",
    },
    description: "Reflexiones, software y ciencia ficción en un mismo universo por Alejandro González Romero",
    authors: [{name: "Alejandro González Romero", url: "https://agrcodes.com"}],
    creator: "Alejandro González Romero",
    publisher: "Alejandro González Romero",
    openGraph: {
        type: "website",
        locale: "es_MX",
        url: "https://agrcodes.com",
        siteName: "agr codes",
        title: "agrcodes.com - Alejandro González Romero",
        description: "Reflexiones, software y ciencia ficción en un mismo universo.",
        images: [
            {
                url: "/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "agrcodes.com - Alejandro González Romero",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "agrcodes.com - Alejandro González Romero",
        description: "Reflexiones, software y ciencia ficción en un mismo universo.",
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

export default async function RootLayout({children,}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
        <head>
            <link rel="icon" href="/favicon.ico" sizes="any"/>
            <link rel="icon" href="/favicon.svg" type="image/svg+xml"/>
            <link rel="apple-touch-icon" href="/apple-touch-icon.png"/>
            <link rel="manifest" href="/site.webmanifest"/>
            <script
                dangerouslySetInnerHTML={{
                    __html: `(function(){try{var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&d)){document.documentElement.classList.add('dark')}}catch(e){}})();`,
                }}
            />
        </head>
        <body className="font-sans antialiased">
        <Suspense>
            <ReCaptchaProvider>
                {children}
            </ReCaptchaProvider>
        </Suspense>
        <SpeedInsights/>
        <Analytics/>
        </body>
        </html>
    )
}