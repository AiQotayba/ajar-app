"use client"

import * as React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Folder, Package, Star, Info, FolderTree, Edit, Trash2, Plus, Save, X } from "lucide-react"
import type { Category, CategoryProperty, CategoryFeature } from "@/lib/types/category"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ImageUpload } from "@/components/ui/image-upload"
import { propertiesApi } from "@/lib/api/properties"
import { featuresApi } from "@/lib/api/features"
import { createCategory, updateCategory } from "@/lib/api/categories"

// Zod Schemas
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

const featureFormSchema = z.object({
    name_ar: z.string().min(1, "الاسم بالعربية مطلوب"),
    name_en: z.string().optional(),
    description_ar: z.string().optional(),
    description_en: z.string().optional(),
    icon: z.string().optional(),
    sort_order: z.number().default(0),
    category_id: z.number(),
})

const childFormSchema = z.object({
    name_ar: z.string().min(1, "الاسم بالعربية مطلوب"),
    name_en: z.string().optional(),
    description_ar: z.string().optional(),
    description_en: z.string().optional(),
    icon: z.string().optional(),
    parent_id: z.number(),
})

type PropertyFormValues = z.infer<typeof propertyFormSchema>
type FeatureFormValues = z.infer<typeof featureFormSchema>
type ChildFormValues = z.infer<typeof childFormSchema>

interface TestDetailSidebarProps {
    category: Category | null
    onEdit?: (category: Category) => void
    onDelete?: (category: Category) => void
}

export function TestDetailSidebar({ category, onEdit, onDelete }: TestDetailSidebarProps) {
    const queryClient = useQueryClient()
    const [isPropertyFormOpen, setIsPropertyFormOpen] = useState(false)
    const [isFeatureFormOpen, setIsFeatureFormOpen] = useState(false)
    const [isChildFormOpen, setIsChildFormOpen] = useState(false)
    const [editingProperty, setEditingProperty] = useState<CategoryProperty | null>(null)
    const [editingFeature, setEditingFeature] = useState<CategoryFeature | null>(null)
    const [editingChild, setEditingChild] = useState<Category | null>(null)

    // Property Form
    const propertyForm = useForm<PropertyFormValues>({
        resolver: zodResolver(propertyFormSchema),
        defaultValues: {
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
            category_id: category?.id || 0,
        },
    })

    // Feature Form
    const featureForm = useForm<FeatureFormValues>({
        resolver: zodResolver(featureFormSchema),
        defaultValues: {
            name_ar: "",
            name_en: "",
            description_ar: "",
            description_en: "",
            icon: "",
            sort_order: 0,
            category_id: category?.id || 0,
        },
    })

    // Child Form
    const childForm = useForm<ChildFormValues>({
        resolver: zodResolver(childFormSchema),
        defaultValues: {
            name_ar: "",
            name_en: "",
            description_ar: "",
            description_en: "",
            icon: "",
            parent_id: category?.id || 0,
        },
    })

    // Property Mutations
    const createPropertyMutation = useMutation({
        mutationFn: (data: any) => propertiesApi.create({
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
            setIsPropertyFormOpen(false)
            propertyForm.reset()
        },
        onError: () => toast.error("فشل إنشاء الخاصية"),
    })

    const updatePropertyMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => propertiesApi.update(id, {
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
            setIsPropertyFormOpen(false)
            setEditingProperty(null)
            propertyForm.reset()
        },
        onError: () => toast.error("فشل تحديث الخاصية"),
    })

    // Feature Mutations
    const createFeatureMutation = useMutation({
        mutationFn: (data: any) => featuresApi.create({
            name: { ar: data.name_ar, en: data.name_en || "" },
            description: { ar: data.description_ar || "", en: data.description_en || "" },
            category_id: data.category_id,
            icon: data.icon || null,
            sort_order: data.sort_order,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] })
            toast.success("تم إنشاء المميزة بنجاح")
            setIsFeatureFormOpen(false)
            featureForm.reset()
        },
        onError: () => toast.error("فشل إنشاء المميزة"),
    })

    const updateFeatureMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => featuresApi.update(id, {
            name: { ar: data.name_ar, en: data.name_en || "" },
            description: { ar: data.description_ar || "", en: data.description_en || "" },
            icon: data.icon || null,
            sort_order: data.sort_order,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] })
            toast.success("تم تحديث المميزة بنجاح")
            setIsFeatureFormOpen(false)
            setEditingFeature(null)
            featureForm.reset()
        },
        onError: () => toast.error("فشل تحديث المميزة"),
    })

    // Child Mutations
    const createChildMutation = useMutation({
        mutationFn: (data: any) => createCategory({
            name: { ar: data.name_ar, en: data.name_en || "" },
            description: { ar: data.description_ar || "", en: data.description_en || "" },
            parent_id: data.parent_id,
            icon: data.icon || null,
            properties_source: "parent_and_custom",
            is_visible: true,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] })
            toast.success("تم إنشاء الفئة الفرعية بنجاح")
            setIsChildFormOpen(false)
            childForm.reset()
        },
        onError: () => toast.error("فشل إنشاء الفئة الفرعية"),
    })

    const updateChildMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => updateCategory(id, {
            name: { ar: data.name_ar, en: data.name_en || "" },
            description: { ar: data.description_ar || "", en: data.description_en || "" },
            icon: data.icon || null,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] })
            toast.success("تم تحديث الفئة الفرعية بنجاح")
            setIsChildFormOpen(false)
            setEditingChild(null)
            childForm.reset()
        },
        onError: () => toast.error("فشل تحديث الفئة الفرعية"),
    })

    const handleEditClick = () => {
        if (category && onEdit) {
            onEdit(category)
        }
    }

    const handleDeleteClick = () => {
        if (category && onDelete) {
            if (confirm(`هل أنت متأكد من حذف الفئة "${category.name.ar}"؟`)) {
                onDelete(category)
            }
        }
    }

    const handlePropertySubmit = (values: PropertyFormValues) => {
        if (!category) return
        if (editingProperty) {
            updatePropertyMutation.mutate({ id: editingProperty.id, data: values })
        } else {
            createPropertyMutation.mutate({ ...values, category_id: category.id })
        }
    }

    const handleFeatureSubmit = (values: FeatureFormValues) => {
        if (!category) return
        if (editingFeature) {
            updateFeatureMutation.mutate({ id: editingFeature.id, data: values })
        } else {
            createFeatureMutation.mutate({ ...values, category_id: category.id })
        }
    }

    const handleChildSubmit = (values: ChildFormValues) => {
        if (!category) return
        if (editingChild) {
            updateChildMutation.mutate({ id: editingChild.id, data: values })
        } else {
            createChildMutation.mutate({ ...values, parent_id: category.id })
        }
    }

    const handleEditProperty = (property: CategoryProperty) => {
        setEditingProperty(property)
        // Map CategoryProperty to form values - note: CategoryProperty uses 'type' but form uses 'data_type'
        const propertyType = property.type === "int" || property.type === "float" || property.type === "bool" || property.type === "string" || property.type === "select"
            ? property.type
            : "string"
        propertyForm.reset({
            name_ar: property.name.ar,
            name_en: property.name.en,
            description_ar: property.description.ar || "",
            description_en: property.description.en || "",
            data_type: propertyType as any,
            is_filterable: property.is_filter,
            is_required: false,
            is_visible: true,
            is_searchable: false,
            sort_order: property.sort_order || 0,
            category_id: category?.id || 0,
        })
        setIsPropertyFormOpen(true)
    }

    const handleEditFeature = (feature: CategoryFeature) => {
        setEditingFeature(feature)
        featureForm.reset({
            name_ar: feature.name.ar,
            name_en: feature.name.en,
            description_ar: feature.description?.ar || "",
            description_en: feature.description?.en || "",
            icon: feature.icon || "",
            sort_order: feature.sort_order || 0,
            category_id: category?.id || 0,
        })
        setIsFeatureFormOpen(true)
    }

    const handleEditChild = (child: Category) => {
        setEditingChild(child)
        childForm.reset({
            name_ar: child.name.ar,
            name_en: child.name.en,
            description_ar: child.description?.ar || "",
            description_en: child.description?.en || "",
            icon: child.icon || "",
            parent_id: category?.id || 0,
        })
        setIsChildFormOpen(true)
    }

    const handleClosePropertyForm = () => {
        setIsPropertyFormOpen(false)
        setEditingProperty(null)
        propertyForm.reset({
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
            category_id: category?.id || 0,
        })
    }

    const handleCloseFeatureForm = () => {
        setIsFeatureFormOpen(false)
        setEditingFeature(null)
        featureForm.reset({
            name_ar: "",
            name_en: "",
            description_ar: "",
            description_en: "",
            icon: "",
            sort_order: 0,
            category_id: category?.id || 0,
        })
    }

    const handleCloseChildForm = () => {
        setIsChildFormOpen(false)
        setEditingChild(null)
        childForm.reset({
            name_ar: "",
            name_en: "",
            description_ar: "",
            description_en: "",
            icon: "",
            parent_id: category?.id || 0,
        })
    }

    React.useEffect(() => {
        if (category) {
            propertyForm.setValue("category_id", category.id)
            featureForm.setValue("category_id", category.id)
            childForm.setValue("parent_id", category.id)
        }
    }, [category])
    if (!category) {
        return (
            <aside className="col-span-1 lg:col-span-2 w-full border-r bg-card   hidden lg:block" dir="rtl">
                <div className="p-6">
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                        <Info className="w-16 h-16 mb-4 opacity-50" />
                        <p className="text-sm">اختر فئة لعرض التفاصيل</p>
                    </div>
                </div>
            </aside>
        )
    }

    const renderPropertyIcon = (icon: string | null | undefined) => {
        if (icon) {
            const iconUrl = icon.startsWith('http')
                ? icon
                : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'https://ajar-backend.mystore.social'}/storage/${icon}`
            return (
                <img
                    src={iconUrl}
                    alt=""
                    className="w-4 h-4 object-cover rounded"
                    onError={(e) => {
                        e.currentTarget.style.display = 'none'
                    }}
                />
            )
        }
        return null
    }

    const renderCategoryIcon = (icon: string | null | undefined) => {
        if (icon) {
            const iconUrl = icon.startsWith('http')
                ? icon
                : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'https://ajar-backend.mystore.social'}/storage/${icon}`
            return (
                <img
                    src={iconUrl}
                    alt=""
                    className="w-12 h-12 object-cover rounded-lg"
                    onError={(e) => {
                        e.currentTarget.style.display = 'none'
                    }}
                />
            )
        }
        return <Folder className="w-12 h-12 text-primary" />
    }

    const getTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            int: "رقم صحيح",
            float: "رقم عشري",
            bool: "نعم/لا",
            string: "نص",
            select: "قائمة منسدلة",
        }
        return types[type] || type
    }

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            int: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
            float: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
            bool: "bg-green-500/10 text-green-700 dark:text-green-400",
            string: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
            select: "bg-pink-500/10 text-pink-700 dark:text-pink-400",
        }
        return colors[type] || "bg-slate-500/10 text-slate-700 dark:text-slate-400"
    }

    return (
        <aside className="col-span-1 lg:col-span-2 w-full overflow-auto border-r bg-card hidden lg:flex flex-col" dir="rtl">
            {/* Header */}
            <div className="border-b p-4 bg-muted/30">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">تفاصيل الفئة</h2>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEditClick}
                            className="flex items-center gap-2"
                        >
                            <Edit className="w-4 h-4" />
                            تعديل
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDeleteClick}
                            className="flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            حذف
                        </Button>
                    </div>
                </div>

                {/* Category Icon and Name */}
                <div className="flex items-center gap-4">
                    {renderCategoryIcon(category.icon)}
                    <div className="flex-1">
                        <h3 className="text-xl font-bold">{category.name.ar || category.name.en}</h3>
                        {category.name.en && category.name.en !== category.name.ar && (
                            <p className="text-sm text-muted-foreground mt-1">{category.name.en}</p>
                        )}
                    </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 my-4 flex-wrap">
                    <Badge variant={category.is_visible ? "default" : "secondary"}>
                        {category.is_visible ? "ظاهرة" : "مخفية"}
                    </Badge>
                    <Badge variant="outline">
                        {category.properties_source === "custom" ? "مخصصة" :
                            category.properties_source === "parent" ? "من الأب" : "من الأب ومخصصة"}
                    </Badge>
                    {category.listings_count > 0 && (
                        <Badge variant="secondary">
                            {category.listings_count} إعلان
                        </Badge>
                    )}
                </div>
                {/* Description */}
                {category.description && (category.description.ar || category.description.en) && (
                    <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            الوصف
                        </h4>
                        <p className="text-sm text-muted-foreground">
                            {category.description.ar || category.description.en}
                        </p>
                    </div>
                )}
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
                <div className="p-4">
                    <Tabs defaultValue="children" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-4">
                            <TabsTrigger value="children" className="flex items-center gap-2">
                                <FolderTree className="w-4 h-4" />
                                الفئات الفرعية ({category.children?.length || 0})
                            </TabsTrigger>
                            <TabsTrigger value="properties" className="flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                الخصائص ({category.properties?.length || 0})
                            </TabsTrigger>
                            <TabsTrigger value="features" className="flex items-center gap-2">
                                <Star className="w-4 h-4" />
                                المميزات ({category.features?.length || 0})
                            </TabsTrigger>
                        </TabsList>

                        {/* Properties Tab */}
                        <TabsContent value="properties" className="mt-0">
                            <div className="space-y-4">
                                {/* Form */}
                                {isPropertyFormOpen && (
                                    <Form {...propertyForm}>
                                        <form onSubmit={propertyForm.handleSubmit(handlePropertySubmit)} className="border rounded-lg p-4 bg-muted/30 space-y-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-sm font-semibold">
                                                    {editingProperty ? "تعديل خاصية" : "إضافة خاصية جديدة"}
                                                </h4>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleClosePropertyForm}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField
                                                    control={propertyForm.control}
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
                                                    control={propertyForm.control}
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
                                                    control={propertyForm.control}
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
                                                    control={propertyForm.control}
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
                                                    control={propertyForm.control}
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
                                                    control={propertyForm.control}
                                                    name="is_filterable"
                                                    render={({ field }) => (
                                                        <FormItem className="flex items-end">
                                                            <div className="flex items-center gap-2">
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value}
                                                                        onCheckedChange={field.onChange}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="!mt-0">استخدام كفلتر</FormLabel>
                                                            </div>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>


                                            <Button
                                                type="submit"
                                                className="w-full"
                                                disabled={createPropertyMutation.isPending || updatePropertyMutation.isPending}
                                            >
                                                <Save className="w-4 h-4 mr-2" />
                                                {createPropertyMutation.isPending || updatePropertyMutation.isPending
                                                    ? "جاري الحفظ..."
                                                    : editingProperty
                                                        ? "تحديث"
                                                        : "إضافة"}
                                            </Button>
                                        </form>
                                    </Form>
                                )}

                                {/* Add Button */}
                                {!isPropertyFormOpen && (
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => setIsPropertyFormOpen(true)}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        إضافة خاصية جديدة
                                    </Button>
                                )}

                                {/* Properties List */}
                                {category.properties && category.properties.length > 0 ? (
                                    <div className="space-y-2">
                                        {category.properties.map((property: CategoryProperty) => (
                                            <div
                                                key={property.id}
                                                className="border rounded-lg p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-2 flex-1">
                                                        {renderPropertyIcon(property.icon)}
                                                        <div className="flex-1">
                                                            <h5 className="font-medium text-sm">
                                                                {property.name.ar || property.name.en}
                                                            </h5>
                                                            {property.description && (property.description.ar || property.description.en) && (
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    {property.description.ar || property.description.en}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge className={getTypeColor(property.type)}>
                                                            {getTypeLabel(property.type)}
                                                        </Badge>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEditProperty(property)}
                                                        >
                                                            <Edit className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                    {property.is_filter && (
                                                        <Badge variant="outline" className="text-xs">
                                                            فلتر
                                                        </Badge>
                                                    )}
                                                    {property.options && property.options.length > 0 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {property.options.length} خيار
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    !isPropertyFormOpen && (
                                        <div className="text-center py-8">
                                            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                                            <p className="text-sm text-muted-foreground">لا توجد خصائص</p>
                                        </div>
                                    )
                                )}
                            </div>
                        </TabsContent>

                        {/* Features Tab */}
                        <TabsContent value="features" className="mt-0">
                            <div className="space-y-4">
                                {/* Form */}
                                {isFeatureFormOpen && (
                                    <Form {...featureForm}>
                                        <form onSubmit={featureForm.handleSubmit(handleFeatureSubmit)} className="border rounded-lg p-4 bg-muted/30 space-y-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-sm font-semibold">
                                                    {editingFeature ? "تعديل مميزة" : "إضافة مميزة جديدة"}
                                                </h4>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleCloseFeatureForm}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField
                                                    control={featureForm.control}
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
                                                    control={featureForm.control}
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
                                                    control={featureForm.control}
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
                                                    control={featureForm.control}
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
                                                control={featureForm.control}
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

                                            <Button
                                                type="submit"
                                                className="w-full"
                                                disabled={createFeatureMutation.isPending || updateFeatureMutation.isPending}
                                            >
                                                <Save className="w-4 h-4 mr-2" />
                                                {createFeatureMutation.isPending || updateFeatureMutation.isPending
                                                    ? "جاري الحفظ..."
                                                    : editingFeature
                                                        ? "تحديث"
                                                        : "إضافة"}
                                            </Button>
                                        </form>
                                    </Form>
                                )}

                                {/* Add Button */}
                                {!isFeatureFormOpen && (
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => setIsFeatureFormOpen(true)}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        إضافة مميزة جديدة
                                    </Button>
                                )}

                                {/* Features List */}
                                {category.features && category.features.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        {category.features.map((feature: CategoryFeature) => (
                                            <div
                                                key={feature.id}
                                                className="border rounded-lg p-2 bg-muted/30 hover:bg-muted/50 transition-colors text-center relative group"
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleEditFeature(feature)}
                                                >
                                                    <Edit className="w-3 h-3" />
                                                </Button>
                                                {feature.icon && (
                                                    <div className="flex justify-center mb-2">
                                                        <img
                                                            src={feature.icon.startsWith('http')
                                                                ? feature.icon
                                                                : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'https://ajar-backend.mystore.social'}/storage/${feature.icon}`}
                                                            alt=""
                                                            className="w-6 h-6 object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none'
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                                <p className="text-xs font-medium">
                                                    {feature.name.ar || feature.name.en}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    !isFeatureFormOpen && (
                                        <div className="text-center py-8">
                                            <Star className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                                            <p className="text-sm text-muted-foreground">لا توجد مميزات</p>
                                        </div>
                                    )
                                )}
                            </div>
                        </TabsContent>

                        {/* Children Tab */}
                        <TabsContent value="children" className="mt-0">
                            <div className="space-y-4">
                                {/* Form */}
                                {isChildFormOpen && (
                                    <Form {...childForm}>
                                        <form onSubmit={childForm.handleSubmit(handleChildSubmit)} className="border rounded-lg p-4 bg-muted/30 space-y-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-sm font-semibold">
                                                    {editingChild ? "تعديل فئة فرعية" : "إضافة فئة فرعية جديدة"}
                                                </h4>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleCloseChildForm}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField
                                                    control={childForm.control}
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
                                                    control={childForm.control}
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
                                                    control={childForm.control}
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
                                                    control={childForm.control}
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
                                                control={childForm.control}
                                                name="icon"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>أيقونة الفئة الفرعية</FormLabel>
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

                                            <Button
                                                type="submit"
                                                className="w-full"
                                                disabled={createChildMutation.isPending || updateChildMutation.isPending}
                                            >
                                                <Save className="w-4 h-4 mr-2" />
                                                {createChildMutation.isPending || updateChildMutation.isPending
                                                    ? "جاري الحفظ..."
                                                    : editingChild
                                                        ? "تحديث"
                                                        : "إضافة"}
                                            </Button>
                                        </form>
                                    </Form>
                                )}

                                {/* Add Button */}
                                {!isChildFormOpen && (
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => setIsChildFormOpen(true)}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        إضافة فئة فرعية جديدة
                                    </Button>
                                )}

                                {/* Children List */}
                                {category.children && category.children.length > 0 ? (
                                    <div className="space-y-1">
                                        {category.children.map((child) => (
                                            <div
                                                key={child.id}
                                                className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 text-sm hover:bg-muted/50 transition-colors group"
                                            >
                                                {child.icon && (
                                                    <img
                                                        src={child.icon.startsWith('http')
                                                            ? child.icon
                                                            : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'https://ajar-backend.mystore.social'}/storage/${child.icon}`}
                                                        alt=""
                                                        className="w-5 h-5 object-cover rounded"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none'
                                                        }}
                                                    />
                                                )}
                                                <span className="flex-1">{child.name.ar || child.name.en}</span>
                                                <div className="flex items-center gap-2">
                                                    {child.listings_count > 0 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {child.listings_count} إعلان
                                                        </Badge>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => handleEditChild(child)}
                                                    >
                                                        <Edit className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    !isChildFormOpen && (
                                        <div className="text-center py-8">
                                            <FolderTree className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                                            <p className="text-sm text-muted-foreground">لا توجد فئات فرعية</p>
                                        </div>
                                    )
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Metadata */}
                    <div className="pt-4 mt-6 border-t">
                        <div className="space-y-2 text-xs text-muted-foreground">
                            <div className="flex justify-between">
                                <span>تاريخ الإنشاء:</span>
                                <span>{new Date(category.created_at).toLocaleDateString('ar-SA')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>آخر تحديث:</span>
                                <span>{new Date(category.updated_at).toLocaleDateString('ar-SA')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>ترتيب العرض:</span>
                                <span>{category.sort_order}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </aside>
    )
}
