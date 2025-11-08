/**
 * Filter Badge Component
 * مكون عرض عدد الفلاتر النشطة
 */
import { Badge } from "@/components/ui/badge"
import { useAdvancedFilters } from "@/hooks/use-advanced-filters"
import { useTranslations } from "next-intl"

interface FilterBadgeProps {
  className?: string
}

export function FilterBadge({ className }: FilterBadgeProps) {
  const { getActiveFiltersCount, hasActiveFilters } = useAdvancedFilters()
  const t = useTranslations('filters.badge')
  const activeCount = getActiveFiltersCount()

  if (!hasActiveFilters) {
    return null
  }

  return (
    <Badge 
      variant="secondary" 
      className={`bg-primary text-primary-foreground ${className}`}
    >
      {t('activeFilters', { count: activeCount })}
    </Badge>
  )
}
