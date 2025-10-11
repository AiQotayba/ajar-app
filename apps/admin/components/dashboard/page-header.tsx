import { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
    title: string
    description?: string
    icon?: LucideIcon
    action?: {
        label: string
        onClick: () => void
        icon?: LucideIcon
    }
    className?: string
}

export function PageHeader({
    title,
    description,
    icon,
    action,
    className,
}: PageHeaderProps) {
    const Icon = icon
    const ActionIcon = action?.icon
    const defaultGradient = "from-primary via-primary/80 to-primary/60"
    const titleGradient = `bg-gradient-to-r ${defaultGradient}`

    return (
        <div className={cn("flex items-center justify-between", className)}>
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 p-3 shadow-lg">
                            <Icon className="h-7 w-7 text-primary" />
                        </div>
                    )}
                    <h1 className={cn("text-4xl font-bold bg-clip-text text-transparent", titleGradient)}>
                        {title}
                    </h1>
                </div>
                {description && (
                    <p className="text-muted-foreground text-lg ml-0">{description}</p>
                )}
            </div>
            {action && (
                <Button
                    size="lg"
                    className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
                    onClick={action.onClick}
                >
                    {ActionIcon && <ActionIcon className="h-5 w-5" />}
                    {action.label}
                </Button>
            )}
        </div>
    )
}
