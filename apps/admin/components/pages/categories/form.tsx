"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { FolderTree, Languages, Image as ImageIcon, Upload } from "lucide-react"
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
import { createCategory, updateCategory } from "@/lib/api/categories"
import type { Category } from "@/lib/types/category"
import { getCategories } from "@/lib/api/categories"
import { ImageUpload } from "@/components/ui/image-upload"

// Form validation schema
const categoryFormSchema = z.object({
    name_ar: z.string().min(2, "اسم الفئة بالعربية يجب أن يكون حرفين على الأقل"),
    name_en: z.string().min(2, "اسم الفئة بالإنجليزية يجب أن يكون حرفين على الأقل"),
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

    // Fetch all categories for parent selection
    const { data: categoriesData } = useQuery({
        queryKey: ["categories"],
        queryFn: getCategories,
    })

    // Get all categories and flatten them for selection
    const allCategories = (categoriesData?.data as unknown as Category[]) || []
    
    // Flatten all categories including children
    const flattenCategories = (categories: Category[]): Category[] => {
        return categories.reduce((acc: Category[], cat: Category) => {
            acc.push(cat)
            if (cat.children && cat.children.length > 0) {
                acc.push(...flattenCategories(cat.children))
            }
            return acc
        }, [])
    }

    const availableCategories = flattenCategories(allCategories)
    
    // Filter out the current category being edited and its children to prevent circular reference
    const selectableCategories = mode === "update" && category
        ? availableCategories.filter((cat: Category) => {
            // Can't select itself as parent
            if (cat.id === category.id) return false
            
            // Can't select its own children as parent
            const isChildOfCurrent = (parentCat: Category, childId: number): boolean => {
                if (parentCat.id === childId) return true
                if (parentCat.children && parentCat.children.length > 0) {
                    return parentCat.children.some(child => isChildOfCurrent(child, childId))
                }
                return false
            }
            
            return !isChildOfCurrent(category, cat.id)
        })
        : availableCategories

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

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: any) => createCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["table-data", urlEndpoint] })
            queryClient.invalidateQueries({ queryKey: ["categories"] })
            onOpenChange(false)
            form.reset()
        },
        onError: (error: any) => {
            toast.error("حدث خطأ أثناء إضافة الفئة", {
                description: error.message,
            })
        },
    })

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (data: any) => updateCategory(category!.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["table-data", urlEndpoint] })
            queryClient.invalidateQueries({ queryKey: ["categories"] })
            onOpenChange(false)
        },
        onError: (error: any) => {
            toast.error("حدث خطأ أثناء تحديث الفئة", {
                description: error.message,
            })
        },
    })

    const onSubmit = (values: CategoryFormValues) => {
        const formattedData = {
            name: {
                ar: values.name_ar,
                en: values.name_en,
            },
            description: {
                ar: values.description_ar || "",
                en: values.description_en || "",
            },
            parent_id: values.parent_id ? parseInt(values.parent_id) : null,
            icon: values.icon || null,
            properties_source: values.properties_source,
            is_visible: values.is_visible,
        }

        if (mode === "create") {
            createMutation.mutate(formattedData)
        } else {
            updateMutation.mutate(formattedData)
        }
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
                        {mode === "create" ? "إضافة فئة جديدة" : "تعديل الفئة"}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === "create"
                            ? "قم بإضافة فئة جديدة للإعلانات"
                            : "قم بتعديل بيانات الفئة"}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Tabs defaultValue="ar" dir="rtl">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="ar" className="gap-2">
                                    <Languages className="h-4 w-4" />
                                    العربية
                                </TabsTrigger>
                                <TabsTrigger value="en" className="gap-2">
                                    <Languages className="h-4 w-4" />
                                    English
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="ar" className="space-y-4 mt-4">
                                <FormField
                                    control={form.control}
                                    name="name_ar"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>اسم الفئة بالعربية</FormLabel>
                                            <FormControl>
                                                <Input placeholder="أدخل اسم الفئة" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description_ar"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>الوصف بالعربية</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="أدخل وصف الفئة"
                                                    className="min-h-[100px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>

                            <TabsContent value="en" className="space-y-4 mt-4">
                                <FormField
                                    control={form.control}
                                    name="name_en"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category Name in English</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter category name" {...field} />
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
                                            <FormLabel>Description in English</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Enter category description"
                                                    className="min-h-[100px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>
                        </Tabs>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="parent_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>الفئة الأب</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="اختر الفئة الأب (اختياري)" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="none">بدون فئة أب (فئة رئيسية)</SelectItem>
                                                {selectableCategories.map((cat: Category) => {
                                                    // Determine indentation level based on parent hierarchy
                                                    const getIndentLevel = (categoryId: number, categories: Category[], level: number = 0): number => {
                                                        for (const c of categories) {
                                                            if (c.id === categoryId) return level
                                                            if (c.children && c.children.length > 0) {
                                                                const childLevel = getIndentLevel(categoryId, c.children, level + 1)
                                                                if (childLevel > -1) return childLevel
                                                            }
                                                        }
                                                        return -1
                                                    }
                                                    
                                                    const indentLevel = getIndentLevel(cat.id, allCategories)
                                                    const prefix = '　'.repeat(indentLevel) // Full-width space for RTL
                                                    const isParent = cat.parent_id === null
                                                    
                                                    return (
                                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                                            {prefix}{cat.icon && `${cat.icon} `}{cat.name.ar} 
                                                            {!isParent && " (فرعية)"}
                                                        </SelectItem>
                                                    )
                                                })}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            اتركه فارغاً لإنشاء فئة رئيسية
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="icon"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Upload className="h-4 w-4" />
                                            أيقونة الفئة
                                        </FormLabel>
                                        <FormControl>
                                            <ImageUpload
                                                value={field.value}
                                                onChange={field.onChange}
                                                folder="properties"
                                                aspectRatio="square"
                                                maxSize={2}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            ارفع أيقونة للفئة (حجم مربع، أقصى حجم 2 ميجابايت)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="properties_source"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>مصدر الخصائص</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="custom">خصائص مخصصة</SelectItem>
                                            <SelectItem value="parent">خصائص الفئة الأب</SelectItem>
                                            <SelectItem value="parent_and_custom">
                                                خصائص الفئة الأب + مخصصة
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        حدد من أين تأتي خصائص الفئة
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="is_visible"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">إظهار الفئة</FormLabel>
                                        <FormDescription>
                                            عند التفعيل، ستظهر الفئة في التطبيق
                                        </FormDescription>
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

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                            >
                                إلغاء
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "جاري الحفظ..." : mode === "create" ? "إضافة" : "تحديث"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

