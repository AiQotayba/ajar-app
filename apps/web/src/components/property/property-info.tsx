import { Bath, Bed, CheckCircle, DollarSign, Maximize2, Palette, Shield, Sofa } from "lucide-react"
import { useLocale } from "next-intl"

interface PropertyInfoProps {
  title: string
  description: string
  price: string
  currency?: string
  type?: 'rent' | 'sale'
  category?: string
  location?: string
  condition?: any
  material?: any
  color?: any
  insurance?: number | null
  payEvery?: number | null
  period?: string
  bedrooms?: number
  bathrooms?: number
  area?: string
  deposit?: string
  furnished?: boolean
  width?: number
  height?: number
  depth?: number
  property?: any
}

export function PropertyInfo({
  title,
  description,
  price,
  currency,
  type,
  category,
  location,
  condition,
  material,
  color,
  insurance,
  payEvery,
  period,
  bedrooms,
  bathrooms,
  area,
  deposit,
  furnished,
  width,
  height,
  depth,
  property,
}: PropertyInfoProps) {
  const locale = useLocale()
  console.log({ property })
  return (
    <div className="space-y-4">
      {/* Title & Description */}
      <div className="space-y-2">
        <h1 className="text-lg font-bold text-foreground leading-relaxed">{title}</h1>
        {description && <p className="text-muted-foreground leading-relaxed">{description}</p>}
      </div>

      {/* Price */}
      <div className="flex items-center gap-2">
        <div className="text-xl font-bold text-primary">{price}</div>
      </div>

      {/* Category & Location */}
      {(category || location) && (
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          {category && (
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
              {category}
            </span>
          )}
          {location && (
            <span className="px-3 py-1 rounded-full bg-muted/50 text-muted-foreground">
              {location}
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-4 border-t border-border text-sm">
        {property?.map((item: any) => (
          <div key={item.id}>
            {item.property.icon && (
              <img src={item.property.icon} alt={item.property.name[locale as any]} className="w-4 h-4" />
            )}
            <span className="px-2 py-1 font-bold">
              {item.property.name[locale as any]}
            </span>

            <span className="px-2 py-1 ">
              {typeof item.value === 'object' ? item.value[locale as any] : item.value}
            </span>

          </div>
        ))}
      </div>
    </div>
  )
} 