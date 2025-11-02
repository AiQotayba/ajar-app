"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { FolderTree, Upload } from "lucide-react"
import { toast } from "sonner"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { createCategory, updateCategory, getCategories } from "@/lib/api/categories"
import type { Category } from "@/lib/types/category"
import { ImageUpload } from "@/components/ui/image-upload"

const categoryFormSchema = z.object({
	name_ar: z.string().min(1, "الاسم مطلوب."),
	name_en: z.string().min(1, "الاسم بالإنجليزية مطلوب."),
	description_ar: z.string().optional(),
	description_en: z.string().optional(),
	parent_id: z.string().optional(),
	icon: z.string().optional(),
	properties_source: z.enum(["custom", "parent", "parent_and_custom"]).default("custom"),
	is_visible: z.boolean().default(true),
})

type CategoryFormValues = z.infer<typeof categoryFormSchema>

interface CategoryFormProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	urlEndpoint: string
	category?: Category | null
	mode: "create" | "update"
	defaultParentId?: number | null
}

export function CategoryForm({ open, onOpenChange, urlEndpoint, category, mode, defaultParentId }: CategoryFormProps) {
	const queryClient = useQueryClient()

	const { data: categoriesData } = useQuery({ queryKey: ["categories"], queryFn: getCategories })
	const allCategories = (categoriesData?.data as unknown as Category[]) || []

	const flattenCategories = (categories: Category[]): Category[] =>
		categories.reduce((acc: Category[], cat: Category) => {
			acc.push(cat)
			if (cat.children && cat.children.length > 0) acc.push(...flattenCategories(cat.children))
			return acc
		}, [])

	const availableCategories = flattenCategories(allCategories)

	const form = useForm<CategoryFormValues>({
		resolver: zodResolver(categoryFormSchema),
		defaultValues: {
			name_ar: category?.name.ar || "",
			name_en: category?.name.en || "",
			description_ar: category?.description?.ar || "",
			description_en: category?.description?.en || "",
			parent_id: category?.parent_id?.toString() || defaultParentId?.toString() || undefined,
			icon: category?.icon || "",
			properties_source: category?.properties_source || "custom",
			is_visible: category?.is_visible ?? true,
		},
	})

	const createMutation = useMutation({
		mutationFn: (payload: any) => createCategory(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["table-data", urlEndpoint] })
			queryClient.invalidateQueries({ queryKey: ["categories"] })
			onOpenChange(false)
			form.reset()
			toast.success("تم إنشاء الفئة.")
		},
		onError: () => toast.error("فشل الحفظ — راجع الأخطاء."),
	})

	const updateMutation = useMutation({
		mutationFn: (payload: any) => updateCategory(category!.id, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["table-data", urlEndpoint] })
			queryClient.invalidateQueries({ queryKey: ["categories"] })
			onOpenChange(false)
			toast.success("تم حفظ التغييرات.")
		},
		onError: () => toast.error("فشل الحفظ — حاول مرة أخرى."),
	})

	const onSubmit = (values: CategoryFormValues) => {
		const payload = {
			name: { ar: values.name_ar, en: values.name_en },
			description: { ar: values.description_ar || "", en: values.description_en || "" },
			parent_id: values.parent_id && values.parent_id !== "none" ? parseInt(values.parent_id) : null,
			icon: values.icon || null,
			properties_source: values.properties_source,
			is_visible: values.is_visible,
		}

		if (mode === "create") createMutation.mutate(payload)
		else updateMutation.mutate(payload)
	}

	const isLoading = createMutation.isPending || updateMutation.isPending

	React.useEffect(() => {
		if (category && mode === "update") {
			form.reset({
				name_ar: category.name.ar,
				name_en: category.name.en,
				description_ar: category.description?.ar || "",
				description_en: category.description?.en || "",
				parent_id: category.parent_id?.toString() || undefined,
				icon: category.icon || "",
				properties_source: category.properties_source,
				is_visible: category.is_visible,
			})
		}
	}, [category, mode, form])

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<FolderTree className="h-5 w-5" />
						{mode === "create" ? "إنشاء فئة جديدة" : "تعديل الفئة"}
					</DialogTitle>
					<DialogDescription>
						{mode === "create" ? "أضف فئة رئيسية أو فرعية جديدة" : "قم بتحديث بيانات الفئة"}
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<Tabs defaultValue="ar" dir="rtl">
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger value="ar">العربية</TabsTrigger>
								<TabsTrigger value="en">English</TabsTrigger>
							</TabsList>

							<TabsContent value="ar" className="space-y-4 mt-4">
								<FormField control={form.control} name="name_ar" render={({ field }) => (
									<FormItem>
										<FormLabel>اسم الفئة بالعربية</FormLabel>
										<FormControl>
											<Input placeholder="مثال: عقارات" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)} />

								<FormField control={form.control} name="description_ar" render={({ field }) => (
									<FormItem>
										<FormLabel>الوصف بالعربية</FormLabel>
										<FormControl>
											<Textarea placeholder="وصف مختصر للفئة" className="min-h-[100px]" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)} />
							</TabsContent>

							<TabsContent value="en" className="space-y-4 mt-4">
								<FormField control={form.control} name="name_en" render={({ field }) => (
									<FormItem>
										<FormLabel>Category Name</FormLabel>
										<FormControl>
											<Input placeholder="e.g. Real Estate" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)} />

								<FormField control={form.control} name="description_en" render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Textarea placeholder="Short description" className="min-h-[100px]" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)} />
							</TabsContent>
						</Tabs>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FormField control={form.control} name="parent_id" render={({ field }) => (
								<FormItem>
									<FormLabel>الفئة الأب</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="اختر الفئة الأب (اختياري)" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="none">بدون فئة أب (فئة رئيسية)</SelectItem>
											{availableCategories.map((cat) => (
												<SelectItem key={cat.id} value={cat.id.toString()}>
													{cat.icon && `${cat.icon} `}{cat.name.ar}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)} />

							<FormField control={form.control} name="icon" render={({ field }) => (
								<FormItem>
									<FormLabel className="flex items-center gap-2">
										<Upload className="h-4 w-4" />
										أيقونة الفئة
									</FormLabel>
									<FormControl>
										<ImageUpload value={field.value} onChange={field.onChange} folder="listings" aspectRatio="square" maxSize={2} />
									</FormControl>
									<FormDescription>ارفع أيقونة للفئة (حجم مربع، أقصى حجم 2 ميجابايت)</FormDescription>
									<FormMessage />
								</FormItem>
							)} />
						</div>

						<FormField control={form.control} name="properties_source" render={({ field }) => (
							<FormItem>
								<FormLabel>مصدر الخصائص</FormLabel>
								<Select onValueChange={field.onChange} value={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="custom">خصائص مخصصة</SelectItem>
										<SelectItem value="parent">وراثة من الأب</SelectItem>
										<SelectItem value="parent_and_custom">وراثة + مخصصة</SelectItem>
									</SelectContent>
								</Select>
								<FormDescription>حدد مصدر ظهور الخصائص في واجهة إنشاء/تعديل الإعلان.</FormDescription>
								<FormMessage />
							</FormItem>
						)} />

						<FormField control={form.control} name="is_visible" render={({ field }) => (
							<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
								<div className="space-y-0.5">
									<FormLabel className="text-base">مرئي؟</FormLabel>
									<FormDescription>عند التفعيل، ستظهر هذه الفئة للمستخدمين.</FormDescription>
								</div>
								<FormControl>
									<Switch checked={field.value} onCheckedChange={field.onChange} />
								</FormControl>
							</FormItem>
						)} />

						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
								إلغاء
							</Button>
							<Button type="submit" disabled={isLoading}>
								{isLoading ? "جاري الحفظ..." : mode === "create" ? "حفظ" : "تحديث"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}


