/**
 * Collapsible Filter Box Component
 * مكون صندوق الفلاتر القابل للطي والتوسع
 */
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface CollapsibleFilterBoxProps {
  title: string
  children: React.ReactNode
  defaultExpanded?: boolean
  className?: string
  badge?: number
}

export function CollapsibleFilterBox({
  title,
  children,
  defaultExpanded = false,
  className,
  badge
}: CollapsibleFilterBoxProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className={cn("bg-background rounded-xl border border-border", className)}>
      <Button
        variant="ghost"
        className="w-full justify-between p-4 h-auto hover:bg-muted/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Label className="text-base font-semibold">{title}</Label>
          {badge && badge > 0 && (
            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
              {badge}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>
      
      {isExpanded && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  )
}
