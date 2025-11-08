"use client"

import * as React from "react"
import { Calendar, Eye, EyeOff, FolderTree, ListTree } from "lucide-react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Category } from "@/lib/types/category"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Images from "@/components/ui/image"

interface CategoryViewProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	category: Category | null
}

export function CategoryView({ open, onOpenChange, category }: CategoryViewProps) {
	if (!category) return null

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							{category.icon && (
								<div className="h-8 w-8 flex items-center justify-center rounded-lg bg-primary/10 overflow-hidden">
									{category.icon.includes('/') || category.icon.includes('.') ? (
										<Images
											src={category.icon.startsWith('http') ? category.icon : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'https://ajar-backend.mystore.social'}/storage/${category.icon}`}
											className="w-full h-full object-cover"
										/>
									) : (
										<span className="text-xl">{category.icon}</span>
									)}
								</div>
							)}
							<span>تفاصيل الفئة</span>
						</div>
						<Badge variant={category.is_visible ? "default" : "secondary"} className={category.is_visible ? "bg-green-500" : "bg-gray-500"}>
							{category.is_visible ? (<><Eye className="h-3 w-3 mr-1" /> ظاهرة</>) : (<><EyeOff className="h-3 w-3 mr-1" /> مخفية</>)}
						</Badge>
					</DialogTitle>
					<DialogDescription>عرض كامل لتفاصيل الفئة</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					<div className="space-y-4">
						<div className="space-y-2">
							<h3 className="text-sm font-medium text-muted-foreground">اسم الفئة</h3>
							<div className="space-y-1">
								<p className="text-lg font-semibold">{category.name.ar}</p>
								<p className="text-sm text-muted-foreground">{category.name.en}</p>
							</div>
						</div>

						{category.description && (
							<div className="space-y-2">
								<h3 className="text-sm font-medium text-muted-foreground">الوصف</h3>
								<div className="space-y-1">
									<p className="text-sm">{category.description.ar}</p>
									<p className="text-sm text-muted-foreground">{category.description.en}</p>
								</div>
							</div>
						)}
					</div>

					<Separator />

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<h3 className="text-sm font-medium text-muted-foreground">نوع الفئة</h3>
							{category.parent_id === null ? (
								<Badge variant="outline" className="w-fit"><FolderTree className="h-3 w-3 mr-1" /> فئة رئيسية</Badge>
							) : (
								<Badge variant="secondary" className="w-fit"><ListTree className="h-3 w-3 mr-1" /> فئة فرعية</Badge>
							)}
						</div>

						<div className="space-y-2">
							<h3 className="text-sm font-medium text-muted-foreground">مصدر الخصائص</h3>
							<Badge variant="outline" className="w-fit">
								{category.properties_source === "custom" && "خصائص مخصصة"}
								{category.properties_source === "parent" && "خصائص الفئة الأب"}
								{category.properties_source === "parent_and_custom" && "خصائص الفئة الأب + مخصصة"}
							</Badge>
						</div>

						<div className="space-y-2">
							<h3 className="text-sm font-medium text-muted-foreground">عدد الإعلانات</h3>
							<div className="h-10 w-16 rounded-lg bg-blue-500/10 flex items-center justify-center">
								<span className="text-lg font-bold text-blue-600">{category.listings_count}</span>
							</div>
						</div>

						<div className="space-y-2">
							<h3 className="text-sm font-medium text-muted-foreground">ترتيب العرض</h3>
							<Badge variant="secondary" className="w-fit font-mono">{category.sort_order}</Badge>
						</div>
					</div>

					<Separator />

					{category.properties && category.properties.length > 0 && (
						<>
							<div className="space-y-3">
								<h3 className="text-sm font-medium flex items-center gap-2">الخصائص <Badge variant="secondary">{category.properties.length}</Badge></h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									{category.properties.map((property) => (
										<Card key={property.id}>
											<CardHeader className="p-4 pb-2">
												<CardTitle className="text-sm flex items-center justify-between">
													<span>{property.name.ar}</span>
													<Badge variant="outline" className="text-xs">{property.type}</Badge>
												</CardTitle>
												<CardDescription className="text-xs">{property.name.en}</CardDescription>
											</CardHeader>
											<CardContent className="p-4 pt-0">
												<div className="flex items-center gap-2 text-xs">
													{(property as any).is_filter && <Badge variant="secondary" className="text-xs">فلتر</Badge>}
													<span className="text-muted-foreground">ترتيب: {(property as any).sort_order}</span>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							</div>
							<Separator />
						</>
					)}

					{category.children && category.children.length > 0 && (
						<>
							<div className="space-y-3">
								<h3 className="text-sm font-medium flex items-center gap-2">الفئات الفرعية <Badge variant="secondary">{category.children.length}</Badge></h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									{category.children.map((child) => (
										<Card key={child.id}>
											<CardHeader className="p-4">
												<CardTitle className="text-sm flex items-center gap-2">
													{child.icon && <span className="text-lg">{child.icon}</span>}
													<div className="flex-1">
														<div>{child.name.ar}</div>
														<div className="text-xs font-normal text-muted-foreground">{child.name.en}</div>
													</div>
													<Badge variant={child.is_visible ? "default" : "secondary"}>{child.listings_count}</Badge>
												</CardTitle>
											</CardHeader>
										</Card>
									))}
								</div>
							</div>
							<Separator />
						</>
					)}

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
						<div className="flex items-center gap-2">
							<Calendar className="h-3 w-3" />
							<span className="font-medium">تاريخ الإنشاء: </span>
							{format(new Date(category.created_at), "dd MMM yyyy - HH:mm", { locale: ar })}
						</div>
						<div className="flex items-center gap-2">
							<Calendar className="h-3 w-3" />
							<span className="font-medium">آخر تحديث: </span>
							{format(new Date(category.updated_at), "dd MMM yyyy - HH:mm", { locale: ar })}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}


