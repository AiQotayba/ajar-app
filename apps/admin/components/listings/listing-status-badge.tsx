import { Badge } from "@/components/ui/badge"
import { CheckCircle2Icon, ClockIcon, XCircleIcon, FileTextIcon } from "lucide-react"
import type { Listing } from "@/lib/types/listing"

interface ListingStatusBadgeProps {
  status: Listing["status"]
}

const statusConfig = {
  draft: {
    label: "مسودة",
    variant: "outline" as const,
    icon: FileTextIcon,
    className: "border-gray-400 text-gray-700 dark:text-gray-300",
  },
  in_review: {
    label: "قيد المراجعة",
    variant: "outline" as const,
    icon: ClockIcon,
    className: "border-yellow-500 text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30",
  },
  approved: {
    label: "معتمد",
    variant: "outline" as const,
    icon: CheckCircle2Icon,
    className: "border-green-500 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30",
  },
  rejected: {
    label: "مرفوض",
    variant: "outline" as const,
    icon: XCircleIcon,
    className: "border-red-500 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30",
  },
}

export function ListingStatusBadge({ status }: ListingStatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className="size-3" />
      {config.label}
    </Badge>
  )
}
