import { Bath, Bed, CheckCircle, DollarSign, Maximize2, Palette, Shield, Sofa } from "lucide-react"

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
}: PropertyInfoProps) {
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
        {/* {price && (
          <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-lg font-bold">
            {price}
          </div>
        )} */}
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


      {/* Property Details - Top Row */}
      {(furnished !== undefined || area || insurance || bedrooms || bathrooms) && (
        <div className="grid grid-cols-2 gap-3 py-4 border-t border-border text-sm">
          {furnished !== undefined && (
            <div className="flex items-center gap-2">
              <Sofa className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{furnished ? "مفروش" : "غير مفروش"}</span>
            </div>
          )}
          {area && (
            <div className="flex items-center gap-2">
              <Maximize2 className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{area}</span>
            </div>
          )}
          {insurance && (
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{insurance.toLocaleString()} {currency} تأمين</span>
            </div>
          )}
          {bedrooms && (
            <div className="flex items-center gap-2">
              <Bed className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{bedrooms} غرف</span>
            </div>
          )}
          {bathrooms && (
            <div className="flex items-center gap-2">
              <Bath className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{bathrooms} حمام</span>
            </div>
          )}
        </div>
      )}

      {/* Additional Details - Bottom Section */}
      {(condition || material || color || width || height || depth) && (
        <div className="grid grid-cols-2 gap-3 py-4 border-b border-border text-sm">
          <Row value={condition} label="الحالة" Icon={CheckCircle} />
          <Row value={material} label="المادة" Icon={Shield} />
          <Row value={color} label="اللون" Icon={Palette} />
          <Row value={width} label="العرض" Icon={Maximize2} />
          <Row value={height} label="الارتفاع" Icon={Maximize2} />
          <Row value={depth} label="العمق" Icon={Maximize2} />
          <Row value={deposit} label="الإيجار" Icon={DollarSign} />
          {condition && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">الحالة:</span>
              <span className="font-medium">{condition}</span>
            </div>
          )}
          {material && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">المادة:</span>
              <span className="font-medium">{material}</span>
            </div>
          )}
          {color && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">اللون:</span>
              <span className="font-medium">{color}</span>
            </div>
          )}
          {width && width > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">العرض:</span>
              <span className="font-medium">{width} سم</span>
            </div>
          )}
          {height && height > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">الارتفاع:</span>
              <span className="font-medium">{height} سم</span>
            </div>
          )}
          {depth && depth > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">العمق:</span>
              <span className="font-medium">{depth} سم</span>
            </div>
          )}
          {deposit && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{deposit}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Row({ value, label, Icon }: { value: number | string | undefined, label: string, Icon: any }) {
  if (!value) return <></>;
  else if (value && typeof value === 'number' && value > 0) return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="font-medium">{value} {label}</span>
    </div>
  )
}