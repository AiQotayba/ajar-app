"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Save } from "lucide-react"
import type { Category } from "@/lib/types/category"
import { api } from "@/lib/api"
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
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { ImageUpload } from "@/components/ui/image-upload"
import { ApiResponse } from "@/lib/api-client"

const categoryFormSchema = z.object({
    name_ar: z.string().min(1, "الاسم بالعربية مطلوب"),
    name_en: z.string().optional(),
    description_ar: z.string().optional(),
    description_en: z.string().optional(),
    parent_id: z.string().optional(),
    icon: z.string().optional(),
    properties_source: z.enum(["custom", "parent", "parent_and_custom"]).default("custom"),
    is_visible: z.boolean().default(true),
})

type CategoryFormValues = z.infer<typeof categoryFormSchema>

interface CategoryFormDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    category: Category | null
}

export function CategoryFormDrawer({ open, onOpenChange, category }: CategoryFormDrawerProps) {
    const queryClient = useQueryClient()

    const { data: categoriesData } = useQuery({ queryKey: ["categories"], queryFn: () => api.get(`/admin/categories`) })
    const allCategories = (categoriesData?.data as unknown as Category[]) || []

    // Flatten categories to exclude current category and its children
    const flattenCategories = (categories: Category[], excludeId?: number): Category[] =>
        categories.reduce((acc: Category[], cat: Category) => {
            if (cat.id !== excludeId) {
                acc.push(cat)
                if (cat.children && cat.children.length > 0) {
                    acc.push(...flattenCategories(cat.children, excludeId))
                }
            }
            return acc
        }, [])

    const availableCategories = category
        ? flattenCategories(allCategories, category.id)
        : flattenCategories(allCategories)

    const isEditMode = !!category

    // Helper function to normalize icon URL - extract relative path if it's a full URL
    const normalizeIconUrl = (icon: string | null | undefined): string | null => {
        if (!icon) return null

        // If it's already a relative path (doesn't start with http), return as is
        if (!icon.startsWith('http://') && !icon.startsWith('https://')) {
            return icon
        }

        // Extract relative path from full URL
        // Example: "https://ajar-backend.mystore.social/storage/listings/image.webp" -> "listings/image.webp"
        const storageMatch = icon.match(/\/storage\/(.+)$/)
        if (storageMatch && storageMatch[1]) {
            return storageMatch[1]
        }

        // Fallback: try to extract path after the last /storage/
        const parts = icon.split('/storage/')
        if (parts.length > 1) {
            return parts[parts.length - 1]
        }

        // If we can't extract, return null to avoid duplication
        return null
    }

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(categoryFormSchema),
        defaultValues: {
            name_ar: category?.name.ar || "",
            name_en: category?.name.en || "",
            description_ar: category?.description?.ar || "",
            description_en: category?.description?.en || "",
            parent_id: category?.parent_id?.toString() || undefined,
            icon: normalizeIconUrl(category?.icon) || "",
            properties_source: category?.properties_source || "custom",
            is_visible: category?.is_visible ?? true,
        },
    })

    React.useEffect(() => {
        if (category) {
            form.reset({
                name_ar: category.name.ar,
                name_en: category.name.en,
                description_ar: category.description?.ar || "",
                description_en: category.description?.en || "",
                parent_id: category.parent_id?.toString() || undefined,
                icon: normalizeIconUrl(category.icon) || "",
                properties_source: category.properties_source,
                is_visible: category.is_visible,
            })
        } else {
            form.reset({
                name_ar: "",
                name_en: "",
                description_ar: "",
                description_en: "",
                parent_id: undefined,
                icon: "",
                properties_source: "custom",
                is_visible: true,
            })
        }
    }, [category, form])

    const createMutation = useMutation({
        mutationFn: (data: CategoryFormValues) => {
            return api.post(`/admin/categories`, {
                name: { ar: data.name_ar, en: data.name_en || "" },
                description: { ar: data.description_ar || "", en: data.description_en || "" },
                parent_id: data.parent_id && data.parent_id !== "none" ? parseInt(data.parent_id) : null,
                icon: normalizeIconUrl(data.icon) || null,
                properties_source: data.properties_source,
                is_visible: data.is_visible,
            })
        },
        onSuccess: (data: ApiResponse<Category>) => {
            queryClient.invalidateQueries({ queryKey: ["categories"] })
            toast.success(data?.message)
            onOpenChange(false)
            form.reset()
        },
        onError: () => {
            toast.error("فشل إنشاء التصنيف")
        },
    })

    const updateMutation = useMutation({
        mutationFn: (data: CategoryFormValues) => {
            if (!category) throw new Error("Category is required")
            return api.put(`/admin/categories/${category.id}`, {
                name: { ar: data.name_ar, en: data.name_en || "" },
                description: { ar: data.description_ar || "", en: data.description_en || "" },
                parent_id: data.parent_id && data.parent_id !== "none" ? parseInt(data.parent_id) : null,
                icon: normalizeIconUrl(data.icon) || null,
                properties_source: data.properties_source,
                is_visible: data.is_visible,
            })
        },
        onSuccess: (data: ApiResponse<Category>) => {
            queryClient.invalidateQueries({ queryKey: ["categories"] })
            toast.success(data?.message)
            onOpenChange(false)
        },
        onError: () => {
            toast.error("فشل تحديث التصنيف")
        },
    })

    const onSubmit = (values: CategoryFormValues) => {
        if (isEditMode) {
            updateMutation.mutate(values)
        } else {
            createMutation.mutate(values)
        }
    }

    const isLoading = createMutation.isPending || updateMutation.isPending

    return (
        <Drawer open={open} onOpenChange={onOpenChange} direction="left">
            <DrawerContent className="w-full sm:max-w-lg text-start" dir="rtl">
                <DrawerHeader>
                    <DrawerTitle>{isEditMode ? "تعديل التصنيف" : "إضافة تصنيف جديد"}</DrawerTitle>
                    <DrawerDescription>
                        {isEditMode ? "قم بتحديث بيانات التصنيف" : "أضف تصنيفاً جديداً للعقارات"}
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
                                        <FormLabel>الاسم (عربي) *</FormLabel>
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
                            name="parent_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>الفئة الأب</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || "none"}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="اختر الفئة الأب (اختياري)" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">لا يوجد (فئة رئيسية)</SelectItem>
                                            {availableCategories.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                                    {cat.name.ar || cat.name.en}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="icon"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>أيقونة التصنيف</FormLabel>
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

                        <FormField
                            control={form.control}
                            name="properties_source"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>مصدر الخصائص</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent dir="rtl">
                                            <SelectItem value="custom">مخصصة</SelectItem>
                                            <SelectItem value="parent">من الأب</SelectItem>
                                            <SelectItem value="parent_and_custom">من الأب ومخصصة</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="is_visible"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">حالة الرؤية</FormLabel>
                                        <div className="text-sm text-muted-foreground">
                                            إظهار أو إخفاء التصنيف في الواجهة الأمامية
                                        </div>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
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
                                {isLoading ? "جاري الحفظ..." : isEditMode ? "تحديث" : "إضافة"}
                            </Button>
                        </DrawerFooter>
                    </form>
                </Form>
            </DrawerContent>
        </Drawer>
    )
}

