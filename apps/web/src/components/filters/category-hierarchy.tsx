/**
 * Category Hierarchy Component
 * مكون عرض التصنيفات الهرمية
 */
import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useLocale } from 'next-intl'

interface Category {
  id: number
  name: {
    ar: string
    en: string
  }
  parent_id?: number
  children?: Category[]
  level?: number
}

interface CategoryHierarchyProps {
  categories: Category[]
  selectedCategoryId?: string
  onCategorySelect: (categoryId: string) => void
  className?: string
}

export function CategoryHierarchy({ 
  categories, 
  selectedCategoryId, 
  onCategorySelect, 
  className 
}: CategoryHierarchyProps) {
  const locale = useLocale() as 'ar' | 'en'
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())

  const toggleExpanded = (categoryId: number) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const renderCategory = (category: Category, level: number = 0) => {
    const isExpanded = expandedCategories.has(category.id)
    const hasChildren = category.children && category.children.length > 0
    const isSelected = selectedCategoryId === category.id.toString()

    return (
      <div key={category.id} className="space-y-1">
        <div 
          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
            isSelected 
              ? 'bg-primary text-primary-foreground' 
              : 'hover:bg-muted'
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => onCategorySelect(category.id.toString())}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation()
                toggleExpanded(category.id)
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
          
          {!hasChildren && <div className="w-6" />}
          
          <span className="flex-1 text-sm font-medium">
            {category.name[locale]}
          </span>
          
          {isSelected && (
            <Badge variant="secondary" className="text-xs">
              مختار
            </Badge>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {category.children!.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {categories.map(category => renderCategory(category))}
    </div>
  )
}
