import { Bath, Car, CheckCircle, Heart, Settings, Shield, Truck, Wifi, Wind } from "lucide-react"

interface Feature {
  id: number
  name: string
  description?: string
  icon?: string
}

interface ListingsFeaturesProps {
  features: Feature[]
  locale?: string
}

const iconMap = {
  bath: Bath,
  wifi: Wifi,
  ac: Wind,
  parking: Car,
  delivery: Truck,
  handmade: Settings,
  adjustable: Settings,
  foldable: Settings,
  storage: Shield,
  wheels: Car,
  waterproof: Shield,
  eco: Heart,
  default: CheckCircle,
}

export function ListingsFeatures({ features, locale = 'ar' }: ListingsFeaturesProps) { 
  if (!features || features.length === 0) {
    return null
  }

  const getIcon = (featureName: string, icon?: string) => {
    const name = featureName.toLowerCase()
    
    // Check for specific keywords in the feature name
    if (name.includes('توصيل') || name.includes('delivery')) return Truck
    if (name.includes('يدوي') || name.includes('handmade')) return Settings
    if (name.includes('تعديل') || name.includes('adjustable')) return Settings
    if (name.includes('طي') || name.includes('foldable')) return Settings
    if (name.includes('تخزين') || name.includes('storage')) return Shield
    if (name.includes('عجلات') || name.includes('wheel')) return Car
    if (name.includes('ماء') || name.includes('water')) return Shield
    if (name.includes('بيئ') || name.includes('eco')) return Heart
    
    // Return default icon
    return CheckCircle
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-foreground">
        {locale === 'ar' ? 'المميزات:' : 'Features:'}
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {features.map((feature) => {
          const Icon = getIcon(feature.name, feature.icon)
          return (
            <div
              key={feature.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50 hover:bg-muted/70 transition-colors"
            >
              <div className="flex-shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-foreground block">
                  {feature.name}
                </span>
                {feature.description && (
                  <span className="text-xs text-muted-foreground block mt-0.5">
                    {feature.description}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
