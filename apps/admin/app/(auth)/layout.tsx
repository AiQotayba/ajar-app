import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authentication - أجار",
  description: "تسجيل الدخول إلى لوحة تحكم أجار",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}

