import { ReactNode } from "react"

interface AuthLayoutProps {
  title: string
  subtitle?: string | ReactNode
  children: ReactNode
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {title}
          </h1>
          {subtitle && (
            <div className="text-muted-foreground text-lg">
              {subtitle}
            </div>
          )}
        </div>

        {/* Content Card */}
        <div className="rounded-2xl border border-border bg-card shadow-2xl p-8">
          {children}
        </div>
      </div>
    </div>
  )
}

