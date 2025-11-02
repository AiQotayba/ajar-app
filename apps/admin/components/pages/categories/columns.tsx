"use client"

import * as React from "react"
import { FolderTree, ChevronLeft, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger
} from "@/components/ui/hover-card"
import type { TableColumn } from "@/components/table/table-core"
import type { Category } from "@/lib/types/category"
import Image from "next/image"

export const categoriesColumns: TableColumn<Category>[] = [
	{
		key: "name",
		label: "اسم الفئة",
		sortable: true,
		width: "min-w-[250px]",
		render: (_, row) => (
			<div className="flex items-center gap-3">
				{row.icon && (
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden">
						{row.icon && (
							<Image
								src={row.icon}
								alt={row.name?.ar}
								className="w-full h-full object-cover"
							/>
						)}
					</div>
				)}
				aa
				<div className="flex-1">
					<div className="font-semibold text-foreground flex items-center gap-2">
						{row.name?.ar}
					</div>
					<div className="text-xs text-muted-foreground">{row.name?.en}</div>
				</div>
			</div>
		),
	},
	{
		key: "parent_id",
		label: "الفئة الأب",
		sortable: true,
		width: "w-40",
		render: (_, row) => {
			if (row.parent_id === null) {
				return <Badge variant="outline">فئة رئيسية</Badge>
			}
			return <span className="text-sm text-muted-foreground">{(row as any).parent_name || "-"}</span>
		},
	},
	{
		key: "listings_count",
		label: "عدد الإعلانات",
		sortable: true,
		width: "w-32",
		render: (_, row) => (
			<div className="flex items-center gap-2">
				<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
					<span className="text-sm font-bold text-blue-600">{row.listings_count}</span>
				</div>
			</div>
		),
	},
	{
		key: "properties",
		label: "الخصائص",
		width: "w-32",
		render: (_, row) => {
			if (!row.properties || row.properties.length === 0) {
				return <Badge variant="outline" className="text-muted-foreground">لا توجد</Badge>
			}

			return (
				<HoverCard>
					<HoverCardTrigger asChild>
						<Button variant="ghost" size="sm" className="h-8 gap-2 hover:bg-blue-500/10">
							<Info className="h-3 w-3 text-blue-500" />
							<Badge variant="secondary" className="font-mono">
								{row.properties.length}
							</Badge>
						</Button>
					</HoverCardTrigger>
					<HoverCardContent className="w-80" align="start">
						<div className="space-y-2">
							<h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
								<span>خصائص الفئة</span>
								<Badge variant="secondary">{row.properties.length}</Badge>
							</h4>
							<div className="space-y-2 max-h-60 overflow-y-auto">
								{row.properties.map((prop, idx) => (
									<div
										key={prop.id || idx}
										className="flex items-start justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
									>
										<div className="flex-1">
											<div className="font-medium text-sm">{prop.name.ar}</div>
											<div className="text-xs text-muted-foreground">{prop.name.en}</div>
										</div>
										<Badge variant="outline" className="text-xs ml-2">
											{prop.type}
										</Badge>
									</div>
								))}
							</div>
						</div>
					</HoverCardContent>
				</HoverCard>
			)
		},
	},
	{
		key: "features",
		label: "المميزات",
		width: "w-32",
		render: (_, row) => {
			if (!row.features || row.features.length === 0) {
				return <Badge variant="outline" className="text-muted-foreground">لا توجد</Badge>
			}
			return (
				<Badge variant="secondary" className="font-mono">{row.features.length}</Badge>
			)
		},
	},
	{
		key: "is_visible",
		label: "الحالة",
		sortable: true,
		width: "w-32",
		render: (_, row) => (
			<Badge
				variant={row.is_visible ? "default" : "secondary"}
				className={row.is_visible ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-muted"}
			>
				{row.is_visible ? "ظاهرة" : "مخفية"}
			</Badge>
		),
	},
]


