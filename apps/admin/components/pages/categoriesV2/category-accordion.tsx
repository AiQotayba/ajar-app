"use client"

import * as React from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Folder, FolderOpen, ChevronRight } from "lucide-react"
import type { Category } from "@/lib/types/category"
import { cn } from "@/lib/utils"
import Images from "@/components/ui/image"

interface CategoriesAccordionProps {
	categories: Category[]
	onSelectCategory: (category: Category | null) => void
	selectedCategory: Category | null
}

export function CategoriesAccordion({ categories, onSelectCategory, selectedCategory }: CategoriesAccordionProps) {
	const renderCategoryIcon = (icon: string | null | undefined, hasChildren: boolean) => {
		if (icon) {
			const iconUrl = icon.startsWith('http')
				? icon
				: `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'https://ajar-backend.mystore.social'}/storage/${icon}`
			return (
				<Images
					src={iconUrl}
					alt=""
					fill={false}
					width={20}
					height={20}
					className="w-5 h-5 object-cover rounded flex-shrink-0"
					onError={(e) => {
						e.currentTarget.style.display = 'none'
					}}
				/>
			)
		}
		return hasChildren ? (
			<FolderOpen className="w-5 h-5 text-primary flex-shrink-0" />
		) : (
			<Folder className="w-5 h-5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
		)
	}

	const CategoryItem = ({ category, level = 0 }: { category: Category; level?: number }) => {
		const hasChildren = category.children && category.children.length > 0
		const isSelected = selectedCategory?.id === category.id
		const itemId = `category-${category.id}-${level}`

		// للفئات الفرعية (level > 0)، نستخدم عرض بسيط بدون Accordion
		if (level > 0) {
			const [isExpanded, setIsExpanded] = React.useState(false)

			return (
				<div
					className={cn(
						"border rounded-lg mb-2 transition-colors",
						isSelected && "bg-primary/5 border-primary/20"
					)}
					style={{ marginRight: `${level * 1.5}rem` }}
				>
					<div
						className={cn(
							"flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors",
							isSelected && "text-primary font-semibold bg-primary/5"
						)}
						onClick={() => {
							onSelectCategory(category)
							if (hasChildren) {
								setIsExpanded(!isExpanded)
							}
						}}
					>
						<div className="flex items-center gap-2 flex-1 text-right">
							{hasChildren && (
								<ChevronRight
									className={cn(
										"w-4 h-4 text-muted-foreground transition-transform",
										isExpanded && "rotate-90"
									)}
								/>
							)}
							{renderCategoryIcon(category.icon, hasChildren)}
							<span className="font-medium">{category.name.ar || category.name.en}</span>
						</div>
						{hasChildren && (
							<span className="text-xs text-muted-foreground bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
								{category.children.length}
							</span>
						)}
					</div>
					{hasChildren && isExpanded && (
						<div className="px-4 pb-3 space-y-2">
							{category.children.map((child) => (
								<CategoryItem key={child.id} category={child} level={level + 1} />
							))}
						</div>
					)}
				</div>
			)
		}

		// للفئات الرئيسية (level === 0)، نستخدم Accordion
		return (
			<AccordionItem
				value={itemId}
				className={cn(
					"border rounded-lg mb-2 transition-colors",
					isSelected && "bg-primary/5 border-primary/20"
				)}
			>
				<AccordionTrigger
					className={cn(
						"hover:no-underline px-4 py-3",
						isSelected && "text-primary font-semibold"
					)}
					onClick={() => onSelectCategory(category)}
				>
					<div className="flex items-center gap-3 flex-1 text-right">
						<div className="flex items-center gap-2">
							{renderCategoryIcon(category.icon, hasChildren)}
							<span className="font-medium">{category.name.ar || category.name.en}</span>
						</div>
						{hasChildren && (
							<span className="text-xs text-muted-foreground bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
								{category.children.length}
							</span>
						)}
					</div>
				</AccordionTrigger>

				{hasChildren && (
					<AccordionContent className="px-4 pb-3">
						<div className="space-y-2 mt-2">
							{category.children.map((child) => (
								<CategoryItem key={child.id} category={child} level={level + 1} />
							))}
						</div>
					</AccordionContent>
				)}
			</AccordionItem>
		)
	}

	return (
		<div className="max-w-4xl mx-auto" dir="rtl">
			<Accordion type="multiple" className="w-full">
				{categories.map((category) => (
					<CategoryItem key={category.id} category={category} />
				))}
			</Accordion>
		</div>
	)
}
