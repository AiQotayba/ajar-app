/**
 * Category Tabs Component
 * مكون عرض التصنيفات في شكل tabs
 */
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

interface CategoryTabsProps {
  categories: Category[]
  selectedCategoryId?: string
  onCategorySelect: (categoryId: string) => void
  className?: string
}

export function CategoryTabs({ 
  categories, 
  selectedCategoryId, 
  onCategorySelect, 
  className 
}: CategoryTabsProps) {
  const locale = useLocale() as 'ar' | 'en'
  const [activeTab, setActiveTab] = useState<string>('')

  const handleCategorySelect = (categoryId: string) => {
    onCategorySelect(categoryId)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  return (
    <div className={`w-full ${className}`}>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <TabsTrigger 
              key={category.id} 
              value={category.id.toString()}
              className="flex items-center gap-2"
            >
              {category.name[locale]}
              {selectedCategoryId === category.id.toString() && (
                <Badge variant="secondary" className="text-xs">
                  ✓
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id.toString()} className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {category.children?.map((subCategory) => (
                <button
                  key={subCategory.id}
                  onClick={() => handleCategorySelect(subCategory.id.toString())}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategoryId === subCategory.id.toString()
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {subCategory.name[locale]}
                </button>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
