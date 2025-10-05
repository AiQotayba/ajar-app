import { Bath, Wifi, Wind, Car } from "lucide-react"

interface Feature {
  icon: string
  label: string
}

interface PropertyFeaturesProps {
  features: Feature[]
}

const iconMap = {
  bath: Bath,
  wifi: Wifi,
  ac: Wind,
  parking: Car,
}

export function PropertyFeatures({ features }: PropertyFeaturesProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-bold text-foreground">مزايا:</h2>
      <div className="flex flex-wrap gap-2">
        {features.map((feature, index) => {
          const Icon = iconMap[feature.icon as keyof typeof iconMap]
          return (
            <div
              key={index}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-light text-primary text-sm font-medium"
            >
              {Icon && <Icon className="h-4 w-4" />}
              <span>{feature.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
