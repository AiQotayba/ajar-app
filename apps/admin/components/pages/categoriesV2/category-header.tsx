"use client"

import { Folder, Edit, Trash2 } from "lucide-react"
import type { Category } from "@/lib/types/category"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"
import Images from "@/components/ui/image"

interface CategoryHeaderProps {
	category: Category
	onEdit?: (category: Category) => void
	onDelete?: (category: Category) => void
}

export function CategoryHeader({ category, onEdit, onDelete }: CategoryHeaderProps) {
	const renderCategoryIcon = (icon: string | null | undefined) => {
		if (icon) {
			const iconUrl = icon.startsWith('http')
				? icon
				: `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'https://ajar-backend.mystore.social'}/storage/${icon}`
			return (
				<Images
					src={iconUrl}
					alt=""
					className="w-12 h-12 object-cover rounded-lg"
					onError={(e) => {
						e.currentTarget.style.display = 'none'
					}}
				/>
			)
		}
		return <Folder className="w-12 h-12 text-primary" />
	}

	const handleDeleteClick = () => {
		if (onDelete && confirm(`هل أنت متأكد من حذف الفئة "${category.name.ar}"؟`)) {
			onDelete(category)
		}
	}

	return (
		<div className="border-b p-4 bg-muted/30">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg font-semibold">تفاصيل الفئة</h2>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => onEdit?.(category)}
						className="flex items-center gap-2"
					>
						<Edit className="w-4 h-4" />
						تعديل
					</Button>
					<Button
						variant="destructive"
						size="sm"
						onClick={handleDeleteClick}
						className="flex items-center gap-2"
					>
						<Trash2 className="w-4 h-4" />
						حذف
					</Button>
				</div>
			</div>

			<div className="flex items-center gap-4">
				{renderCategoryIcon(category.icon)}
				<div className="flex-1">
					<h3 className="text-xl font-bold">{category.name.ar || category.name.en}</h3>
					{category.name.en && category.name.en !== category.name.ar && (
						<p className="text-sm text-muted-foreground mt-1">{category.name.en}</p>
					)}
				</div>
			</div>

			<div className="flex items-center gap-2 my-4 flex-wrap">
				<Badge variant={category.is_visible ? "default" : "secondary"}>
					{category.is_visible ? "ظاهرة" : "مخفية"}
				</Badge>
				<Badge variant="outline">
					{category.properties_source === "custom" ? "مخصصة" :
						category.properties_source === "parent" ? "من الأب" : "من الأب ومخصصة"}
				</Badge>
				{category.listings_count > 0 && (
					<Badge variant="secondary">
						{category.listings_count} إعلان
					</Badge>
				)}
			</div>

			{category.description && (category.description.ar || category.description.en) && (
				<div>
					<h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
						<Info className="w-4 h-4" />
						الوصف
					</h4>
					<p className="text-sm text-muted-foreground">
						{category.description.ar || category.description.en}
					</p>
				</div>
			)}
		</div>
	)
}

