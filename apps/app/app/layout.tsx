import { BottomNav } from "@/components/layout/bottom-nav"
import type { Metadata } from "next"
import { Cairo } from "next/font/google"
import type React from "react"
import "./globals.css"

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
})

export const metadata: Metadata = {
  title: "أجار - منصة العقارات",
  description: "منصة شاملة لإيجار وبيع العقارات",
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="antialiased">
        <main className="min-h-screen">{children}</main>
        <BottomNav  />
      </body>
    </html>
  )
}
