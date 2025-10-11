import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { QueryProvider } from "@/lib/query-provider"
import { Suspense } from "react"
import "./globals.css"
import { Toaster } from "sonner"

export const metadata: Metadata = {
  title: "Ajar Admin Panel",
  description: "لوحة تحكم إدارية لإدارة العقارات",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <QueryProvider>
            {children}
            <Toaster position="top-center" richColors />
          </QueryProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
