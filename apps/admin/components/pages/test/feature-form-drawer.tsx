"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Save } from "lucide-react"
import type { CategoryFeature } from "@/lib/types/category"
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ImageUpload } from "@/components/ui/image-upload"
import { featuresApi } from "@/lib/api/features"

const featureFormSchema = z.object({
	name_ar: z.string().min(1, "الاسم بالعربية مطلوب"),
	name_en: z.string().optional(),
	description_ar: z.string().optional(),
	description_en: z.string().optional(),
	icon: z.string().optional(),
	sort_order: z.number().default(0),
	category_id: z.number(),
})

type FeatureFormValues = z.infer<typeof featureFormSchema>

interface FeatureFormDrawerProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	categoryId: number
	feature?: CategoryFeature | null
}

export function FeatureFormDrawer({ open, onOpenChange, categoryId, feature }: FeatureFormDrawerProps) {
	const queryClient = useQueryClient()

	const form = useForm<FeatureFormValues>({
		resolver: zodResolver(featureFormSchema),
		defaultValues: {
			name_ar: feature?.name.ar || "",
			name_en: feature?.name.en || "",
			description_ar: feature?.description?.ar || "",
			description_en: feature?.description?.en || "",
			icon: feature?.icon || "",
			sort_order: feature?.sort_order || 0,
			category_id: categoryId,
		},
	})

	React.useEffect(() => {
		if (feature) {
			form.reset({
				name_ar: feature.name.ar,
				name_en: feature.name.en,
				description_ar: feature.description?.ar || "",
				description_en: feature.description?.en || "",
				icon: feature.icon || "",
				sort_order: feature.sort_order || 0,
				category_id: categoryId,
			})
		} else {
			form.reset({
				name_ar: "",
				name_en: "",
				description_ar: "",
				description_en: "",
				icon: "",
				sort_order: 0,
				category_id: categoryId,
			})
		}
	}, [feature, categoryId, form])

	const createMutation = useMutation({
		mutationFn: (data: FeatureFormValues) => featuresApi.create({
			name: { ar: data.name_ar, en: data.name_en || "" },
			description: { ar: data.description_ar || "", en: data.description_en || "" },
			category_id: data.category_id,
			icon: data.icon || "",
			sort_order: data.sort_order,
		}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["categories"] })
			toast.success("تم إنشاء المميزة بنجاح")
			onOpenChange(false)
			form.reset()
		},
		onError: () => toast.error("فشل إنشاء المميزة"),
	})

	const updateMutation = useMutation({
		mutationFn: (data: FeatureFormValues) => featuresApi.update(feature!.id, {
			name: { ar: data.name_ar, en: data.name_en || "" },
			description: { ar: data.description_ar || "", en: data.description_en || "" },
			icon: data.icon || "",
			sort_order: data.sort_order,
		}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["categories"] })
			toast.success("تم تحديث المميزة بنجاح")
			onOpenChange(false)
			form.reset()
		},
		onError: () => toast.error("فشل تحديث المميزة"),
	})

	const onSubmit = (values: FeatureFormValues) => {
		if (feature) {
			updateMutation.mutate(values)
		} else {
			createMutation.mutate(values)
		}
	}

	const isLoading = createMutation.isPending || updateMutation.isPending

	return (
		<Drawer open={open} onOpenChange={onOpenChange} direction="left">
			<DrawerContent className="w-full sm:max-w-lg" dir="rtl">
				<DrawerHeader>
					<DrawerTitle>{feature ? "تعديل مميزة" : "إضافة مميزة جديدة"}</DrawerTitle>
					<DrawerDescription>
						{feature ? "قم بتحديث بيانات المميزة" : "أضف مميزة جديدة للفئة"}
					</DrawerDescription>
				</DrawerHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="px-4 space-y-4 pb-4">
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="name_ar"
								render={({ field }) => (
									<FormItem>
										<FormLabel>الاسم (عربي)</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="name_en"
								render={({ field }) => (
									<FormItem>
										<FormLabel>الاسم (إنجليزي)</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="description_ar"
								render={({ field }) => (
									<FormItem>
										<FormLabel>الوصف (عربي)</FormLabel>
										<FormControl>
											<Textarea {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="description_en"
								render={({ field }) => (
									<FormItem>
										<FormLabel>الوصف (إنجليزي)</FormLabel>
										<FormControl>
											<Textarea {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="icon"
							render={({ field }) => (
								<FormItem>
									<FormLabel>أيقونة المميزة</FormLabel>
									<FormControl>
										<ImageUpload
											value={field.value || ""}
											onChange={field.onChange}
											folder="listings"
											aspectRatio="square"
											maxSize={2}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DrawerFooter>
							<Button type="submit" disabled={isLoading} className="w-full">
								<Save className="w-4 h-4 mr-2" />
								{isLoading ? "جاري الحفظ..." : feature ? "تحديث" : "إضافة"}
							</Button>
							<DrawerClose asChild>
								<Button type="button" variant="outline">
									إلغاء
								</Button>
							</DrawerClose>
						</DrawerFooter>
					</form>
				</Form>
			</DrawerContent>
		</Drawer>
	)
}

