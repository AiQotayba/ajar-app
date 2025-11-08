/**
 * Category Selector Component
 * مكون اختيار التصنيفات مع دعم التصنيفات الفرعية
 */
import { useState, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

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

interface CategorySelectorProps {
  categories: Category[]
  selectedCategoryId?: string
  onCategorySelect: (categoryId: string) => void
  placeholder?: string
  label?: string
  className?: string
}

export function CategorySelector({ 
  categories, 
  selectedCategoryId, 
  onCategorySelect, 
  placeholder,
  label,
  className 
}: CategorySelectorProps) {
  const locale = useLocale() as 'ar' | 'en'
  const t = useTranslations('filters.category')
  const defaultPlaceholder = placeholder || t('selectCategory')
  const defaultLabel = label || t('title')
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('')
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('')

  // Organize categories into hierarchy
  const organizeCategories = (categories: Category[]) => {
    const mainCategories = categories.filter(cat => !cat.parent_id)
    const subCategories = categories.filter(cat => cat.parent_id)
    
    return mainCategories.map(main => ({
      ...main,
      children: subCategories.filter(sub => sub.parent_id === main.id)
    }))
  }

  const organizedCategories = organizeCategories(categories)
  const selectedMainCategoryData = organizedCategories.find(cat => cat.id.toString() === selectedMainCategory)
  const availableSubCategories = selectedMainCategoryData?.children || []

  // Initialize from selectedCategoryId
  useEffect(() => {
    if (selectedCategoryId && categories.length > 0) {
      const category = categories.find(cat => cat.id.toString() === selectedCategoryId)
      if (category) {
        if (category.parent_id) {
          setSelectedMainCategory(category.parent_id.toString())
          setSelectedSubCategory(selectedCategoryId)
        } else {
          setSelectedMainCategory(selectedCategoryId)
          setSelectedSubCategory('')
        }
      }
    } else {
      setSelectedMainCategory('')
      setSelectedSubCategory('')
    }
  }, [selectedCategoryId, categories])

  const handleMainCategoryChange = (value: string) => {
    setSelectedMainCategory(value)
    setSelectedSubCategory('')
    onCategorySelect(value)
  }

  const handleSubCategoryChange = (value: string) => {
    setSelectedSubCategory(value)
    onCategorySelect(value)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Category */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">{defaultLabel}</Label>
        <Select value={selectedMainCategory} onValueChange={handleMainCategoryChange}>
          <SelectTrigger className="h-12 rounded-xl bg-primary/5 border-primary/20">
            <SelectValue placeholder={defaultPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {organizedCategories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name[locale]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sub Category */}
      {selectedMainCategory && availableSubCategories.length > 0 && (
        <div className="space-y-2">
          <Label className="text-base font-semibold">{t('subCategory')}</Label>
          <Select value={selectedSubCategory} onValueChange={handleSubCategoryChange}>
            <SelectTrigger className="h-12 rounded-xl bg-primary/5 border-primary/20">
              <SelectValue placeholder={t('selectSubCategory')} />
            </SelectTrigger>
            <SelectContent>
              {availableSubCategories.map((subCategory) => (
                <SelectItem key={subCategory.id} value={subCategory.id.toString()}>
                  {subCategory.name[locale]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
