import { Bath, Car, CheckCircle, Heart, Settings, Shield, Truck, Wifi, Wind } from "lucide-react"
import Image from "next/image"

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


export function ListingsFeatures({ features, locale = 'ar' }: ListingsFeaturesProps) {
  if (!features || features.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-foreground">
        {locale === 'ar' ? 'المميزات:' : 'Features:'}
      </h2>
      <div className="flex flex-wrap gap-3">
        {features.map((feature) => {
          return (
            <div
              key={feature.id}
              className="flex items-center gap-3 bg-primary/10 p-3 rounded-xl transition-colors"
            >
              <div className="flex-shrink-0">
                {feature.icon ? (<Image src={feature.icon} width={20} height={20} className="h-5 w-5 text-primary" alt={`icon ${feature.name}`} />
                ) : <CheckCircle className="h-5 w-5 text-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-b text-foreground block">
                  {feature.name}
                </span>
                {/* {feature.description && (
                  <span className="text-xs text-muted-foreground block mt-0.5">
                    {feature.description}
                  </span>
                )} */}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
