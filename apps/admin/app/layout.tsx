import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { QueryProvider } from "@/lib/query-provider"
import { Suspense } from "react"
import "./globals.css"
import { Toaster } from "sonner"
import ForegroundNotificationListenerProvider from "@/components/notifications/foreground-notification-listener-provider"
import { LogRocketProvider } from "@/components/logrocket-provider"

export const metadata: Metadata = {
  title: "Ajar Admin Panel",
  description: "لوحة تحكم إدارية لإدارة العقارات",
  generator: "v0.app",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />

        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <QueryProvider>
            <LogRocketProvider />
            <ForegroundNotificationListenerProvider />
            {children}
            <Toaster position="top-center" richColors />
          </QueryProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
