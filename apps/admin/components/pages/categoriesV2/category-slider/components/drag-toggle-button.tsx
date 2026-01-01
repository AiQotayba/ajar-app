import * as React from "react"
import { GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DragToggleButtonProps {
	isDragEnabled: boolean
	onToggle: () => void
}

/**
 * DragToggleButton component
 * Memoized to prevent unnecessary re-renders
 */
export const DragToggleButton = React.memo<DragToggleButtonProps>(({ isDragEnabled, onToggle }) => {
	return (
		<div className="flex justify-end mb-4">
			<Button
				variant={isDragEnabled ? "default" : "outline"}
				size="sm"
				onClick={onToggle}
				className="gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
			>
				<GripVertical className="h-4 w-4" />
				<span>{isDragEnabled ? "تعطيل السحب والإفلات" : "تفعيل السحب والإفلات"}</span>
			</Button>
		</div>
	)
})

DragToggleButton.displayName = "DragToggleButton"

