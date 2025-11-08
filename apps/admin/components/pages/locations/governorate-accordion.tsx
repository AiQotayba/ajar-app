"use client"

import * as React from "react"
import { MapPin, Eye, EyeOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Governorate } from "@/lib/types/location"
import { cn } from "@/lib/utils"

interface GovernorateAccordionProps {
	governorates: Governorate[]
	onSelectGovernorate: (governorate: Governorate | null) => void
	selectedGovernorate: Governorate | null
}

export function GovernorateAccordion({ 
	governorates, 
	onSelectGovernorate, 
	selectedGovernorate 
}: GovernorateAccordionProps) {
	return (
		<div className="space-y-2" dir="rtl">
			{governorates.length === 0 ? (
				<div className="text-center py-8 text-muted-foreground">
					<p>لا توجد محافظات</p>
				</div>
			) : (
				governorates.map((governorate) => {
					const isSelected = selectedGovernorate?.id === governorate.id
					
					return (
						<div
							key={governorate.id}
							className={cn(
								"border rounded-lg transition-colors cursor-pointer",
								isSelected && "bg-primary/5 border-primary/20"
							)}
							onClick={() => onSelectGovernorate(governorate)}
						>
							<div
								className={cn(
									"flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50 rounded-lg transition-colors",
									isSelected && "text-primary font-semibold bg-primary/5"
								)}
							>
								<div className="flex items-center gap-3 flex-1">
									<MapPin className={cn(
										"h-5 w-5",
										isSelected ? "text-primary" : "text-muted-foreground"
									)} />
									<div className="flex-1 text-right">
										<p className="font-medium">{governorate.name.ar || governorate.name.en}</p>
										{governorate.name.en && (
											<p className="text-xs text-muted-foreground">{governorate.name.en}</p>
										)}
									</div>
								</div>
								
								<div className="flex items-center gap-2">
									{governorate.cities_count !== undefined && (
										<Badge variant="outline" className="text-xs">
											{governorate.cities_count} مدينة
										</Badge>
									)}
									
									<Badge 
										variant={governorate.is_active !== false ? "default" : "secondary"}
										className={governorate.is_active !== false ? "bg-green-500" : ""}
									>
										{governorate.is_active !== false ? (
											<>
												<Eye className="h-3 w-3 ml-1" />
												نشطة
											</>
										) : (
											<>
												<EyeOff className="h-3 w-3 ml-1" />
												معطلة
											</>
										)}
									</Badge>
								</div>
							</div>
						</div>
					)
				})
			)}
		</div>
	)
}

