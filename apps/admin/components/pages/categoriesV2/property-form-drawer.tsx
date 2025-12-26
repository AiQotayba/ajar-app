"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Save, Package } from "lucide-react"
import type { CategoryProperty } from "@/lib/types/category"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ImageUpload } from "@/components/ui/image-upload"
import { X, Plus } from "lucide-react"
import { api } from "@/lib/api"
import type { ApiResponse } from "@/lib/api-client"

const propertyFormSchema = z.object({
	name_ar: z.string().min(1, "الاسم بالعربية مطلوب"),
	name_en: z.string().optional(),
	description_ar: z.string().optional(),
	description_en: z.string().optional(),
	icon: z.string().min(1, "الأيقونة مطلوبة"),
	type: z.enum(["int", "float", "bool", "datetime", "enum"]).default("int"),
	is_filter: z.boolean().default(false),
	options: z.array(z.union([z.string(), z.number()])).default([]),
	sort_order: z.number().default(0),
	category_id: z.number(),
})

type PropertyFormValues = z.infer<typeof propertyFormSchema>

interface PropertyFormDrawerProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	categoryId: number
	property?: CategoryProperty | null
}

export function PropertyFormDrawer({ open, onOpenChange, categoryId, property }: PropertyFormDrawerProps) {
	const queryClient = useQueryClient()
	const [newOptionValue, setNewOptionValue] = React.useState("")
	const [ErrorRes, setErrorRes] = React.useState("")

	const form = useForm<PropertyFormValues>({
		resolver: zodResolver(propertyFormSchema),
		defaultValues: {
			name_ar: property?.name.ar || "",
			name_en: property?.name.en || "",
			description_ar: property?.description.ar || "",
			description_en: property?.description.en || "",
			icon: property?.icon || "",
			type: (property?.type === "select" ? "enum" : property?.type) as PropertyFormValues["type"] || "int",
			is_filter: property?.is_filter || false,
			options: property?.options || [],
			sort_order: property?.sort_order || 0,
			category_id: categoryId,
		},
	})

	React.useEffect(() => {
		if (property) {
			form.reset({
				name_ar: property.name.ar,
				name_en: property.name.en,
				description_ar: property.description.ar || "",
				description_en: property.description.en || "",
				icon: property.icon || "",
				type: (property.type === "select" ? "enum" : property.type) as PropertyFormValues["type"] || "int",
				is_filter: property.is_filter || false,
				options: property.options || [],
				sort_order: property.sort_order || 0,
				category_id: categoryId,
			})
		} else {
			form.reset({
				name_ar: "",
				name_en: "",
				description_ar: "",
				description_en: "",
				icon: "",
				type: "int",
				is_filter: false,
				options: [],
				sort_order: 0,
				category_id: categoryId,
			})
		}
	}, [property, categoryId, form])

	const handleAddOption = () => {
		if (!newOptionValue.trim()) return

		const currentOptions = form.getValues("options") || []
		const type = form.getValues("type")
		const valueToAdd = type === "int" || type === "float"
			? type === "int" ? Number.parseInt(newOptionValue, 10) : Number.parseFloat(newOptionValue)
			: newOptionValue.trim()

		form.setValue("options", [...currentOptions, valueToAdd])
		setNewOptionValue("")
	}

	const handleRemoveOption = (index: number) => {
		const currentOptions = form.getValues("options") || []
		form.setValue("options", currentOptions.filter((_, i) => i !== index))
	}

	const createMutation = useMutation({
		mutationFn: (data: PropertyFormValues) => {
			// Ensure icon is not empty
			if (!data.icon || data.icon.trim() === "") {
				throw new Error("الأيقونة مطلوبة")
			}
			// Ensure type is not empty
			if (!data.type) {
				throw new Error("النوع مطلوب")
			}
			return api.post('/admin/properties', {
				name: { ar: data.name_ar, en: data.name_en || "" },
				description: { ar: data.description_ar || "", en: data.description_en || "" },
				category_id: data.category_id,
				icon: data.icon.trim(),
				type: data.type,
				is_filter: data.is_filter,
				options: data.options || [],
			})
		},
		onSuccess: (data: ApiResponse) => {
			console.info("✅ Property created:", data)
			if (!data.isError) {
				queryClient.invalidateQueries({ queryKey: ["categories"] })
				toast.success(data?.message || "تم إنشاء الخاصية بنجاح")
				onOpenChange(false)
				form.reset()
			}
			else {
				setErrorRes(data.message || "حدث خطأ غير معروف")
			}
		},
		onError: (error: { message?: string; response?: { data?: { message?: string; errors?: Record<string, string[]> } } }) => {
			const errorMessage = error?.message || error?.response?.data?.message || "فشل إنشاء الخاصية"
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
					} else if (key === "type") {
						form.setError("type", {
							type: "manual",
							message: errors[key][0] || "النوع المحدد غير صالح"
						})
					}
				})
			}
		},
	})

	const updateMutation = useMutation({
		mutationFn: (data: PropertyFormValues) => {
			// Ensure icon is not empty
			if (!data.icon || data.icon.trim() === "") {
				throw new Error("الأيقونة مطلوبة")
			}
			// Ensure type is not empty
			if (!data.type) {
				throw new Error("النوع مطلوب")
			}
			return api.put(`/admin/properties/${property!.id}`, {
				name: { ar: data.name_ar, en: data.name_en || "" },
				description: { ar: data.description_ar || "", en: data.description_en || "" },
				icon: data.icon.trim(),
				type: data.type,
				is_filter: data.is_filter,
				options: data.options || [],
			})
		},
		onSuccess: (data: { message?: string }) => {
			queryClient.invalidateQueries({ queryKey: ["categories"] })
			toast.success(data?.message || "تم تحديث الخاصية بنجاح")
			onOpenChange(false)
			form.reset()
		},
		onError: (error: { message?: string; response?: { data?: { message?: string; errors?: Record<string, string[]> } } }) => {
			const errorMessage = error?.message || error?.response?.data?.message || "فشل تحديث الخاصية"
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
					} else if (key === "type") {
						form.setError("type", {
							type: "manual",
							message: errors[key][0] || "النوع المحدد غير صالح"
						})
					}
				})
			}
		},
	})

	const onSubmit = (values: PropertyFormValues) => {
		// Validate icon before submission
		if (!values.icon || values.icon.trim() === "") {
			form.setError("icon", {
				type: "manual",
				message: "الأيقونة مطلوبة. يرجى رفع صورة للأيقونة"
			})
			toast.error("يرجى رفع صورة للأيقونة قبل الحفظ")
			return
		}

		// Validate type before submission
		if (!values.type) {
			form.setError("type", {
				type: "manual",
				message: "النوع مطلوب"
			})
			toast.error("يرجى اختيار نوع الخاصية")
			return
		}

		if (property) {
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
							<Package className="h-5 w-5 text-primary" />
						</div>
						<div className="flex-1">
							<DrawerTitle>{property ? "تعديل خاصية" : "إضافة خاصية جديدة"}</DrawerTitle>
							<DrawerDescription className="mt-1">
								{property ? "قم بتحديث بيانات الخاصية" : "أضف خاصية جديدة للفئة"}
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
									<FormLabel>أيقونة الخاصية *</FormLabel>
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
											folder="properties"
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

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="type"
								render={({ field }) => (
									<FormItem>
										<FormLabel>النوع *</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="اختر النوع" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="int">رقم صحيح</SelectItem>
												<SelectItem value="float">رقم عشري</SelectItem>
												<SelectItem value="bool">نعم/لا</SelectItem>
												<SelectItem value="datetime">تاريخ ووقت</SelectItem>
												<SelectItem value="enum">قائمة خيارات</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="is_filter"
								render={({ field }) => (
									<FormItem className="flex items-center gap-2 pt-8">
										<FormControl>
											<Checkbox
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
										<FormLabel className="!mt-0">استخدام كفلتر</FormLabel>
									</FormItem>
								)}
							/>
						</div>

						{/* Options Field - Show for int, float and enum types */}
						{form.watch("type") === "int" || form.watch("type") === "float" || form.watch("type") === "enum" ? (
							<FormField
								control={form.control}
								name="options"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											الخيارات {form.watch("type") === "enum" ? "(للنوع enum)" : "(قيم محتملة)"}
										</FormLabel>
										<div className="space-y-2">
											<div className="flex gap-2">
												<Input
													value={newOptionValue}
													onChange={(e) => setNewOptionValue(e.target.value)}
													placeholder={
														form.watch("type") === "int" || form.watch("type") === "float"
															? "أدخل رقم"
															: "أدخل خيار جديد"
													}
													type={form.watch("type") === "int" || form.watch("type") === "float" ? "number" : "text"}
													step={form.watch("type") === "float" ? "any" : undefined}
													onKeyDown={(e) => {
														if (e.key === "Enter") {
															e.preventDefault()
															handleAddOption()
														}
													}}
												/>
												<Button
													type="button"
													variant="outline"
													size="icon"
													onClick={handleAddOption}
													disabled={!newOptionValue.trim()}
												>
													<Plus className="w-4 h-4" />
												</Button>
											</div>
											{field.value && field.value.length > 0 && (
												<div className="flex flex-wrap gap-2">
													{field.value.map((option, index) => (
														<Badge
															key={index}
															variant="secondary"
															className="flex items-center gap-1 px-2 py-1"
														>
															<span>{String(option)}</span>
															<Button
																type="button"
																variant="ghost"
																size="sm"
																className="h-4 w-4 p-0 hover:bg-destructive/10 hover:text-destructive"
																onClick={() => handleRemoveOption(index)}
															>
																<X className="w-3 h-3" />
															</Button>
														</Badge>
													))}
												</div>
											)}
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>
						) : null}

						{ErrorRes && (
							<div className="text-red-500 text-sm">{ErrorRes}</div>
						)}
						<DrawerFooter className="grid grid-cols-2 gap-4">
							<DrawerClose asChild>
								<Button type="button" variant="outline">
									إلغاء
								</Button>
							</DrawerClose>
							<Button type="submit" disabled={isLoading} className="w-full">
								<Save className="w-4 h-4 mr-2" />
								{isLoading ? "جاري الحفظ..." : property ? "تحديث" : "إضافة"}
							</Button>
						</DrawerFooter>
					</form>
				</Form>
			</DrawerContent>
		</Drawer>
	)
}

