"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Save, Star } from "lucide-react"
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
import { api } from "@/lib/api"

const featureFormSchema = z.object({
	name_ar: z.string().min(1, "الاسم بالعربية مطلوب"),
	name_en: z.string().optional(),
	description_ar: z.string().optional(),
	description_en: z.string().optional(),
	icon: z.string().min(1, "الأيقونة مطلوبة"),
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
		mutationFn: (data: FeatureFormValues) => {
			// Ensure icon is not empty
			if (!data.icon || data.icon.trim() === "") {
				throw new Error("الأيقونة مطلوبة")
			}
			return api.post('/admin/features', {
				name: { ar: data.name_ar, en: data.name_en || "" },
				description: { ar: data.description_ar || "", en: data.description_en || "" },
				category_id: data.category_id,
				icon: data.icon.trim(),
				sort_order: data.sort_order,
			})
		},
		onSuccess: (data: any) => {
			queryClient.invalidateQueries({ queryKey: ["categories"] })
			toast.success(data?.message)
			onOpenChange(false)
			form.reset()
		},
		onError: (error: any) => {
			const errorMessage = error?.message || error?.response?.data?.message || "فشل إنشاء المميزة"
			toast.error(errorMessage)

			// Set form errors if API returns validation errors
			if (error?.response?.data?.errors) {
				const errors = error.response.data.errors
				Object.keys(errors).forEach((key) => {
					if (key === "icon") {
						form.setError("icon", {
							type: "manual",
							message: errors[key][0] || "الأيقونة مطلوبة"
						})
					}
				})
			}
		},
	})

	const updateMutation = useMutation({
		mutationFn: (data: FeatureFormValues) => {
			// Ensure icon is not empty
			if (!data.icon || data.icon.trim() === "") {
				throw new Error("الأيقونة مطلوبة")
			}
			return api.put(`/admin/features/${feature!.id}`, {
				name: { ar: data.name_ar, en: data.name_en || "" },
				description: { ar: data.description_ar || "", en: data.description_en || "" },
				icon: data.icon.trim(),
				sort_order: data.sort_order,
			})
		},
		onSuccess: (data: any) => {
			queryClient.invalidateQueries({ queryKey: ["categories"] })
			toast.success(data?.message)
			onOpenChange(false)
			form.reset()
		},
		onError: (error: any) => {
			const errorMessage = error?.message || error?.response?.data?.message || "فشل تحديث المميزة"
			toast.error(errorMessage)

			// Set form errors if API returns validation errors
			if (error?.response?.data?.errors) {
				const errors = error.response.data.errors
				Object.keys(errors).forEach((key) => {
					if (key === "icon") {
						form.setError("icon", {
							type: "manual",
							message: errors[key][0] || "الأيقونة مطلوبة"
						})
					}
				})
			}
		},
	})

	const onSubmit = (values: FeatureFormValues) => {
		// Validate icon before submission
		if (!values.icon || values.icon.trim() === "") {
			form.setError("icon", {
				type: "manual",
				message: "الأيقونة مطلوبة. يرجى رفع صورة للأيقونة"
			})
			toast.error("يرجى رفع صورة للأيقونة قبل الحفظ")
			return
		}

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
					<div className="flex items-center gap-3 mb-2">
						<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
							<Star className="h-5 w-5 text-primary" />
						</div>
						<div className="flex-1">
							<DrawerTitle>{feature ? "تعديل مميزة" : "إضافة مميزة جديدة"}</DrawerTitle>
							<DrawerDescription className="mt-1">
								{feature ? "قم بتحديث بيانات المميزة" : "أضف مميزة جديدة للفئة"}
							</DrawerDescription>
						</div>
					</div>
				</DrawerHeader>

				<Form {...form}>
					<form
						onSubmit={(e) => {
							e.preventDefault()
							e.stopPropagation()
							form.handleSubmit(onSubmit)(e)
						}}
						className="px-4 space-y-4 pb-4"
						noValidate
					>
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
									<FormLabel>أيقونة المميزة *</FormLabel>
									<FormControl>
										<ImageUpload
											value={field.value || ""}
											onChange={(value) => {
												field.onChange(value)
												// Clear error when icon is uploaded
												if (value && value.trim() !== "") {
													form.clearErrors("icon")
												}
											}}
											folder="features"
											aspectRatio="square"
											maxSize={2}
										/>
									</FormControl>
									<FormMessage />
									{!field.value && (
										<p className="text-xs text-muted-foreground mt-1">
											يرجى رفع صورة للأيقونة (مربعة، حجم أقصى 2 ميجابايت)
										</p>
									)}
								</FormItem>
							)}
						/>

						<DrawerFooter className="grid grid-cols-2 gap-4">
							<DrawerClose asChild>
								<Button type="button" variant="outline">
									إلغاء
								</Button>
							</DrawerClose>
							<Button type="submit" disabled={isLoading} className="w-full">
								<Save className="w-4 h-4 mr-2" />
								{isLoading ? "جاري الحفظ..." : feature ? "تحديث" : "إضافة"}
							</Button>
						</DrawerFooter>
					</form>
				</Form>
			</DrawerContent>
		</Drawer>
	)
}

