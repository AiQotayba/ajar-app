/**
 * Filter Badge Component
 * مكون عرض عدد الفلاتر النشطة
 */
import { Badge } from "@/components/ui/badge"
import { useAdvancedFilters } from "@/hooks/use-advanced-filters"

interface FilterBadgeProps {
  className?: string
}

export function FilterBadge({ className }: FilterBadgeProps) {
  const { getActiveFiltersCount, hasActiveFilters } = useAdvancedFilters()
  const activeCount = getActiveFiltersCount()

  if (!hasActiveFilters) {
    return null
  }

  return (
    <Badge 
      variant="secondary" 
      className={`bg-primary text-primary-foreground ${className}`}
    >
      {activeCount} فلتر نشط
    </Badge>
  )
}
