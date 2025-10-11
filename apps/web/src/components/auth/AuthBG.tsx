"use client"

export default function LoginPage({ children }: { children: React.ReactNode }) {
    const dirStyle = `-top-36 absolute rounded-full border-2 `
    return (
        <div className="min-h-screen bg-gradient-to-b from-primary to-[#014533] flex items-start justify-center p-4 relative overflow-hidden">
            {/* Three overlapping circles at top left */}
            <div>
                <div className={`${dirStyle} border-white/20  -right-28 h-72 w-72`} />
                <div className={`${dirStyle} border-white/50  -right-20 h-60 w-60`} />
                <div className={`${dirStyle} border-white/70  -right-10 h-48 w-48`} />
            </div>
            {/* Small decorative elements */}

            <div className="w-full max-w-md relative z-10">
                {children}
            </div>
        </div>
    )
}
