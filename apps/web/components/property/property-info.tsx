import { Bed, Maximize2, DollarSign, Sofa } from "lucide-react"

interface PropertyInfoProps {
  title: string
  description: string
  price: string
  period?: string
  bedrooms: number
  area: string
  deposit: string
  furnished: boolean
}

export function PropertyInfo({
  title,
  description,
  price,
  period,
  bedrooms,
  area,
  deposit,
  furnished,
}: PropertyInfoProps) {
  return (
    <div className="space-y-4">
      {/* Title & Description */}
      <div className="space-y-2">
        <h1 className="text-lg font-bold text-foreground leading-relaxed">{title}</h1>
      </div>

      {/* Price & Period */}
      <div className="flex items-center gap-2">
        <div className="text-2xl font-bold text-primary">{price}$/شهر</div>
        {period && (
          <div className="px-3 py-1 rounded-full bg-primary-light text-primary text-sm font-medium">{period}</div>
        )}
      </div>

      {/* Property Specs */}
      <div className="flex items-center justify-between gap-4 py-4 border-y border-border text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Bed className="h-5 w-5" />
          <span>{bedrooms} غرف</span>
        </div>
        <div className="flex items-center gap-2">
          <Maximize2 className="h-5 w-5" />
          <span>{area}</span>
        </div>
        <div className="flex items-center gap-2">
          <Sofa className="h-5 w-5" />
          <span>{furnished ? "مفروش" : "غير مفروش"}</span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          <span>{deposit}</span>
        </div>
      </div>
    </div>
  )
}
