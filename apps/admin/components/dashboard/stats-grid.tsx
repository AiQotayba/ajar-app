import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface StatCard {
    title: string
    value: string | number
    color: 'blue' | 'green' | 'purple' | 'amber' | 'red' | 'pink' | 'orange' | 'indigo'
    icon?: LucideIcon
    description?: string
}

interface StatsGridProps {
    stats: StatCard[]
    columns?: 2 | 3 | 4
    className?: string
}

const colorClasses = {
    blue: {
        bg: 'from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900',
        text: 'text-blue-700 dark:text-blue-300',
        value: 'text-blue-900 dark:text-blue-100',
        icon: 'text-blue-600 dark:text-blue-400',
    },
    green: {
        bg: 'from-green-50 to-green-100 dark:from-green-950 dark:to-green-900',
        text: 'text-green-700 dark:text-green-300',
        value: 'text-green-900 dark:text-green-100',
        icon: 'text-green-600 dark:text-green-400',
    },
    purple: {
        bg: 'from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900',
        text: 'text-purple-700 dark:text-purple-300',
        value: 'text-purple-900 dark:text-purple-100',
        icon: 'text-purple-600 dark:text-purple-400',
    },
    amber: {
        bg: 'from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900',
        text: 'text-amber-700 dark:text-amber-300',
        value: 'text-amber-900 dark:text-amber-100',
        icon: 'text-amber-600 dark:text-amber-400',
    },
    red: {
        bg: 'from-red-50 to-red-100 dark:from-red-950 dark:to-red-900',
        text: 'text-red-700 dark:text-red-300',
        value: 'text-red-900 dark:text-red-100',
        icon: 'text-red-600 dark:text-red-400',
    },
    pink: {
        bg: 'from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900',
        text: 'text-pink-700 dark:text-pink-300',
        value: 'text-pink-900 dark:text-pink-100',
        icon: 'text-pink-600 dark:text-pink-400',
    },
    orange: {
        bg: 'from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900',
        text: 'text-orange-700 dark:text-orange-300',
        value: 'text-orange-900 dark:text-orange-100',
        icon: 'text-orange-600 dark:text-orange-400',
    },
    indigo: {
        bg: 'from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900',
        text: 'text-indigo-700 dark:text-indigo-300',
        value: 'text-indigo-900 dark:text-indigo-100',
        icon: 'text-indigo-600 dark:text-indigo-400',
    },
}

export function StatsGrid({ stats, columns = 4, className }: StatsGridProps) {
    const gridCols = {
        2: 'md:grid-cols-2',
        3: 'md:grid-cols-3',
        4: 'md:grid-cols-4',
    }

    return (
        <div className={cn('grid grid-cols-1 gap-4', gridCols[columns], className)}>
            {stats.map((stat, index) => {
                const colors = colorClasses[stat.color]
                const Icon = stat.icon

                return (
                    <div
                        key={index}
                        className={cn(
                            'rounded-xl border bg-gradient-to-br p-4 shadow-sm transition-all hover:shadow-md',
                            colors.bg
                        )}
                    >
                        <div className="flex items-start justify-between">
                            <div className="space-y-1 flex-1">
                                <p className={cn('text-sm font-medium', colors.text)}>{stat.title}</p>
                                <p className={cn('text-3xl font-bold mt-1', colors.value)}>
                                    {typeof stat.value === 'number'
                                        ? stat.value.toLocaleString('en-US')
                                        : stat.value}
                                </p>
                                {stat.description && (
                                    <p className={cn('text-xs mt-1', colors.text)}>{stat.description}</p>
                                )}
                            </div>
                            {Icon && (
                                <div className={cn('rounded-lg p-2 bg-white/50 dark:bg-black/20')}>
                                    <Icon className={cn('h-5 w-5', colors.icon)} />
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

