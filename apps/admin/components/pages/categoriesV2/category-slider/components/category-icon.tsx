import * as React from "react"
import { Folder, FolderOpen } from "lucide-react"
import Images from "@/components/ui/image"
import { CategoryApiService } from "../services/category-api.service"

interface CategoryIconProps {
	icon: string | null | undefined
	hasChildren: boolean
	className?: string
}

/**
 * CategoryIcon component with security improvements
 * Memoized to prevent unnecessary re-renders
 */
export const CategoryIcon = React.memo<CategoryIconProps>(({ icon, hasChildren, className = "" }) => {
	const [imageError, setImageError] = React.useState(false)

	// Sanitize and validate icon URL
	const iconUrl = React.useMemo(() => {
		if (!icon || imageError) return null
		return CategoryApiService.sanitizeIconUrl(icon)
	}, [icon, imageError])

	if (iconUrl) {
		return (
			<Images
				src={iconUrl}
				alt=""
				fill={false}
				width={20}
				height={20}
				className={`w-5 h-5 object-cover rounded flex-shrink-0 ${className}`}
				onError={() => {
					setImageError(true)
				}}
			/>
		)
	}

	return hasChildren ? (
		<FolderOpen className={`w-5 h-5 text-primary flex-shrink-0 ${className}`} />
	) : (
		<Folder className={`w-5 h-5 fill-primary text-primary flex-shrink-0 ${className}`} />
	)
})

CategoryIcon.displayName = "CategoryIcon"

