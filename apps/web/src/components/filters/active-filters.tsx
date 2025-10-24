/**
 * Active Filters Component
 * مكون عرض الفلاتر النشطة
 */
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAdvancedFilters } from "@/hooks/use-advanced-filters"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"

interface ActiveFiltersProps {
  className?: string
}

export function ActiveFilters({ className }: ActiveFiltersProps) {
  const { filters, handleFilterChange, handleReset, hasActiveFilters } = useAdvancedFilters()

  // Fetch data for display names
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/user/categories')
      return response.data || []
    }
  })

  const { data: governorates = [] } = useQuery({
    queryKey: ['governorates'],
    queryFn: async () => {
      const response = await api.get('/user/governorates')
      return response.data || []
    }
  })

  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const response = await api.get('/user/cities')
      return response.data || []
    }
  })

  if (!hasActiveFilters) {
    return null
  }

  const getDisplayName = (key: string, value: string) => {
    switch (key) {
      case 'propertyCategory':
        const category = categories.find((c: any) => c.id.toString() === value)
        return category?.name || value
      case 'governorate':
        const governorate = governorates.find((g: any) => g.id.toString() === value)
        return governorate?.name || value
      case 'city':
        const city = cities.find((c: any) => c.id.toString() === value)
        return city?.name || value
      case 'propertyType':
        return value === 'بيع' ? 'بيع' : 'إيجار'
      case 'furnished':
        return value === 'furnished' ? 'مفروش' : 'غير مفروش'
      default:
        return value
    }
  }

  const activeFilters = Object.entries(filters)
    .filter(([key, value]) => value && value !== 'furnished' && value !== 'بيع')
    .map(([key, value]) => ({ key, value, displayName: getDisplayName(key, value) }))

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {activeFilters.map(({ key, value, displayName }) => (
        <Badge key={key} variant="outline" className="flex items-center gap-1">
          <span>{displayName}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => handleFilterChange(key as any, '')}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
      
      {activeFilters.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="text-destructive hover:text-destructive"
        >
          مسح الكل
        </Button>
      )}
    </div>
  )
}
