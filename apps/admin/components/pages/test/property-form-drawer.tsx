"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Save } from "lucide-react"
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
import { propertiesApi } from "@/lib/api/properties"

const propertyFormSchema = z.object({
	name_ar: z.string().min(1, "الاسم بالعربية مطلوب"),
	name_en: z.string().optional(),
	description_ar: z.string().optional(),
	description_en: z.string().optional(),
	data_type: z.enum(["int", "float", "bool", "string", "select", "multi_select"]).default("string"),
	is_filterable: z.boolean().default(false),
	is_required: z.boolean().default(false),
	is_visible: z.boolean().default(true),
	is_searchable: z.boolean().default(false),
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

	const form = useForm<PropertyFormValues>({
		resolver: zodResolver(propertyFormSchema),
		defaultValues: {
			name_ar: property?.name.ar || "",
			name_en: property?.name.en || "",
			description_ar: property?.description.ar || "",
			description_en: property?.description.en || "",
			data_type: (property?.type as any) || "string",
			is_filterable: property?.is_filter || false,
			is_required: false,
			is_visible: true,
			is_searchable: false,
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
				data_type: (property.type as any) || "string",
				is_filterable: property.is_filter,
				is_required: false,
				is_visible: true,
				is_searchable: false,
				sort_order: property.sort_order || 0,
				category_id: categoryId,
			})
		} else {
			form.reset({
				name_ar: "",
				name_en: "",
				description_ar: "",
				description_en: "",
				data_type: "string",
				is_filterable: false,
				is_required: false,
				is_visible: true,
				is_searchable: false,
				sort_order: 0,
				category_id: categoryId,
			})
		}
	}, [property, categoryId, form])

	const createMutation = useMutation({
		mutationFn: (data: PropertyFormValues) => propertiesApi.create({
			name: { ar: data.name_ar, en: data.name_en || "" },
			description: { ar: data.description_ar || "", en: data.description_en || "" },
			category_id: data.category_id,
			data_type: data.data_type,
			is_filterable: data.is_filterable,
			is_required: data.is_required,
			is_visible: data.is_visible,
			is_searchable: data.is_searchable,
			sort_order: data.sort_order,
		}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["categories"] })
			toast.success("تم إنشاء الخاصية بنجاح")
			onOpenChange(false)
			form.reset()
		},
		onError: () => toast.error("فشل إنشاء الخاصية"),
	})

	const updateMutation = useMutation({
		mutationFn: (data: PropertyFormValues) => propertiesApi.update(property!.id, {
			name: { ar: data.name_ar, en: data.name_en || "" },
			description: { ar: data.description_ar || "", en: data.description_en || "" },
			data_type: data.data_type,
			is_filterable: data.is_filterable,
			is_required: data.is_required,
			is_visible: data.is_visible,
			is_searchable: data.is_searchable,
			sort_order: data.sort_order,
		}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["categories"] })
			toast.success("تم تحديث الخاصية بنجاح")
			onOpenChange(false)
			form.reset()
		},
		onError: () => toast.error("فشل تحديث الخاصية"),
	})

	const onSubmit = (values: PropertyFormValues) => {
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
					<DrawerTitle>{property ? "تعديل خاصية" : "إضافة خاصية جديدة"}</DrawerTitle>
					<DrawerDescription>
						{property ? "قم بتحديث بيانات الخاصية" : "أضف خاصية جديدة للفئة"}
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

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="data_type"
								render={({ field }) => (
									<FormItem>
										<FormLabel>النوع</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="string">نص</SelectItem>
												<SelectItem value="int">رقم صحيح</SelectItem>
												<SelectItem value="float">رقم عشري</SelectItem>
												<SelectItem value="bool">نعم/لا</SelectItem>
												<SelectItem value="select">قائمة منسدلة</SelectItem>
												<SelectItem value="multi_select">قائمة متعددة</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="is_filterable"
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

						<DrawerFooter>
							<Button type="submit" disabled={isLoading} className="w-full">
								<Save className="w-4 h-4 mr-2" />
								{isLoading ? "جاري الحفظ..." : property ? "تحديث" : "إضافة"}
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

