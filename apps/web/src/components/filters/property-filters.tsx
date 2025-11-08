/**
 * Property Filters Component
 * مكون عرض خصائص العقار كفلاتر
 */
import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface Property {
  id: number
  category_id?: number
  name: {
    ar: string
    en: string
  }
  description?: {
    ar: string | null
    en: string | null
  }
  icon?: string | null
  type: 'text' | 'number' | 'select' | 'string' | 'int' | 'float' | 'bool'
  is_filter?: boolean
  options?: Array<{
    ar: string
    en: string
  }> | null
  sort_order?: number
  is_visible?: boolean
}

interface Feature {
  id: number
  name: {
    ar: string
    en: string
  }
  description?: {
    ar: string | null
    en: string | null
  }
  icon?: string | null
  sort_order?: number
  is_visible?: boolean
}

interface PropertyFiltersProps {
  properties: Property[]
  features: Feature[]
  selectedProperties: Record<number, string>
  selectedFeatures: number[]
  onPropertyChange: (propertyId: number, value: string) => void
  onFeatureToggle: (featureId: number) => void
  onReset: () => void
  className?: string
}

export function PropertyFilters({
  properties,
  features,
  selectedProperties,
  selectedFeatures,
  onPropertyChange,
  onFeatureToggle,
  onReset,
  className
}: PropertyFiltersProps) {
  const locale = useLocale() as 'ar' | 'en'
  const t = useTranslations('filters.properties')
  const [expandedProperties, setExpandedProperties] = useState<Set<number>>(new Set())

  const togglePropertyExpanded = (propertyId: number) => {
    setExpandedProperties(prev => {
      const newSet = new Set(prev)
      if (newSet.has(propertyId)) {
        newSet.delete(propertyId)
      } else {
        newSet.add(propertyId)
      }
      return newSet
    })
  }

  const renderPropertyFilter = (property: Property) => {
    const isExpanded = expandedProperties.has(property.id)
    const hasValue = selectedProperties[property.id]

    return (
      <div key={property.id} className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">
            {property.name[locale]}
          </Label>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => togglePropertyExpanded(property.id)}
          >
            {isExpanded ? '−' : '+'}
          </Button>
        </div>

        {isExpanded && (
          <div className="space-y-2">
            {property.type === 'bool' ? (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`property-${property.id}`}
                  checked={selectedProperties[property.id] === 'true'}
                  onCheckedChange={(checked) => 
                    onPropertyChange(property.id, checked ? 'true' : 'false')
                  }
                />
                <Label htmlFor={`property-${property.id}`} className="text-sm">
                  {property.name[locale]}
                </Label>
              </div>
            ) : property.type === 'select' && property.options ? (
              <Select
                value={selectedProperties[property.id] || ''}
                onValueChange={(value) => onPropertyChange(property.id, value)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={t('selectProperty', { property: property.name[locale] })} />
                </SelectTrigger>
                <SelectContent>
                  {property.options.map((option, index) => (
                    <SelectItem key={index} value={option[locale]}>
                      {option[locale]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : property.type === 'int' || property.type === 'float' ? (
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder={t('from')}
                  value={selectedProperties[property.id]?.split('-')[0] || ''}
                  onChange={(e) => {
                    const currentValue = selectedProperties[property.id] || ''
                    const parts = currentValue.split('-')
                    const newValue = e.target.value + (parts[1] ? `-${parts[1]}` : '')
                    onPropertyChange(property.id, newValue)
                  }}
                  className="h-10"
                />
                <Input
                  type="number"
                  placeholder={t('to')}
                  value={selectedProperties[property.id]?.split('-')[1] || ''}
                  onChange={(e) => {
                    const currentValue = selectedProperties[property.id] || ''
                    const parts = currentValue.split('-')
                    const newValue = (parts[0] || '') + '-' + e.target.value
                    onPropertyChange(property.id, newValue)
                  }}
                  className="h-10"
                />
              </div>
            ) : (
              <Input
                type="text"
                placeholder={t('enterProperty', { property: property.name[locale] })}
                value={selectedProperties[property.id] || ''}
                onChange={(e) => onPropertyChange(property.id, e.target.value)}
                className="h-10"
              />
            )}

            {hasValue && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                onClick={() => onPropertyChange(property.id, '')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }

  const renderFeatureFilter = (feature: Feature) => {
    const isSelected = selectedFeatures.includes(feature.id)

    return (
      <div key={feature.id} className="flex items-center space-x-2">
        <Checkbox
          id={`feature-${feature.id}`}
          checked={isSelected}
          onCheckedChange={() => onFeatureToggle(feature.id)}
        />
        <Label htmlFor={`feature-${feature.id}`} className="text-sm">
          {feature.name[locale]}
        </Label>
      </div>
    )
  }

  if (properties.length === 0 && features.length === 0) {
    return null
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Properties */}
      {properties.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">{t('propertiesTitle')}</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-destructive hover:text-destructive"
            >
              {t('clearAll')}
            </Button>
          </div>
          
          <div className="space-y-3">
            {properties.map(renderPropertyFilter)}
          </div>
        </div>
      )}

      {/* Features */}
      {features.length > 0 && (
        <div className="space-y-3">
          <Label className="text-base font-semibold">{t('featuresTitle')}</Label>
          
          <div className="grid grid-cols-2 gap-2">
            {features.map(renderFeatureFilter)}
          </div>
        </div>
      )}
    </div>
  )
}
