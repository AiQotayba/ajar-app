import { Badge } from "@/components/ui/badge"
import { CheckIcon, XIcon, KeyIcon, DollarSignIcon } from "lucide-react"
import type { Listing } from "@/lib/types/listing"

interface ListingAvailabilityBadgeProps {
  status: Listing["availability_status"]
}

const availabilityConfig = {
  available: {
    label: "متاح",
    icon: CheckIcon,
    className: "border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30",
  },
  unavailable: {
    label: "غير متاح",
    icon: XIcon,
    className: "border-gray-400 text-gray-700 dark:text-gray-300",
  },
  rented: {
    label: "مؤجر",
    icon: KeyIcon,
    className: "border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30",
  },
  solded: {
    label: "مباع",
    icon: DollarSignIcon,
    className: "border-purple-500 text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30",
  },
}

export function ListingAvailabilityBadge({ status }: ListingAvailabilityBadgeProps) {
  const config = availabilityConfig[status]
  const Icon = config?.icon

  return (
    <Badge variant="outline" className={config?.className}>
     {Icon&& <Icon className="size-3" />}
      {config?.label}
    </Badge>
  )
}
