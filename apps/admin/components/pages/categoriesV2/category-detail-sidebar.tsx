"use client"

import * as React from "react"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Folder, Package, Star, Info, FolderTree, Edit, Trash2, Plus, Sparkles, ArrowRight } from "lucide-react"
import type { Category, CategoryProperty, CategoryFeature } from "@/lib/types/category"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { CategoryFormDrawer } from "./category-form-drawer"
import { FeatureFormDrawer } from "./feature-form-drawer"
import { PropertyFormDrawer } from "./property-form-drawer"
import { ChildCategoryFormDrawer } from "./child-category-form-drawer"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Images from "@/components/ui/image"


interface CategoriesDetailSidebarProps {
    category: Category | null
    onEdit?: (category: Category) => void
    onDelete?: (category: Category) => void
}

export function CategoriesDetailSidebar({ category, onEdit, onDelete }: CategoriesDetailSidebarProps) {
    const queryClient = useQueryClient()

    const [isPropertyDrawerOpen, setIsPropertyDrawerOpen] = useState(false)
    const [isFeatureDrawerOpen, setIsFeatureDrawerOpen] = useState(false)
    const [isChildFormDrawerOpen, setIsChildFormDrawerOpen] = useState(false)
    const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isDeletePropertyDialogOpen, setIsDeletePropertyDialogOpen] = useState(false)
    const [isDeleteFeatureDialogOpen, setIsDeleteFeatureDialogOpen] = useState(false)
    const [isDeleteChildDialogOpen, setIsDeleteChildDialogOpen] = useState(false)
    const [editingProperty, setEditingProperty] = useState<CategoryProperty | null>(null)
    const [editingFeature, setEditingFeature] = useState<CategoryFeature | null>(null)
    const [editingChild, setEditingChild] = useState<Category | null>(null)
    const [deletingProperty, setDeletingProperty] = useState<CategoryProperty | null>(null)
    const [deletingFeature, setDeletingFeature] = useState<CategoryFeature | null>(null)
    const [deletingChild, setDeletingChild] = useState<Category | null>(null)

    const handleEditClick = () => {
        if (category) {
            setIsCategoryFormOpen(true)
        }
    }

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/admin/categories/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] })
            toast.success("تم حذف التصنيف بنجاح")
            setIsDeleteDialogOpen(false)
            if (onDelete && category) {
                onDelete(category)
            }
        },
        onError: () => {
            toast.error("فشل حذف التصنيف")
        },
    })

    const handleDeleteClick = () => {
        if (category) {
            setIsDeleteDialogOpen(true)
        }
    }

    const handleDeleteConfirm = () => {
        if (category) {
            deleteMutation.mutate(category.id)
        }
    }

    // Delete Property Mutation
    const deletePropertyMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/admin/properties/${id}`),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ["categories"] })
            toast.success(data?.message)
            setIsDeletePropertyDialogOpen(false)
            setDeletingProperty(null)
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message
            toast.error(errorMessage)
        },
    })

    // Delete Feature Mutation
    const deleteFeatureMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/admin/features/${id}`),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ["categories"] })
            toast.success(data?.message)
            setIsDeleteFeatureDialogOpen(false)
            setDeletingFeature(null)
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message
            toast.error(errorMessage)
        },
    })

    const handleDeleteProperty = (property: CategoryProperty) => {
        setDeletingProperty(property)
        setIsDeletePropertyDialogOpen(true)
    }

    const handleDeletePropertyConfirm = () => {
        if (deletingProperty) {
            deletePropertyMutation.mutate(deletingProperty.id)
        }
    }

    const handleDeleteFeature = (feature: CategoryFeature) => {
        setDeletingFeature(feature)
        setIsDeleteFeatureDialogOpen(true)
    }

    const handleDeleteFeatureConfirm = () => {
        if (deletingFeature) {
            deleteFeatureMutation.mutate(deletingFeature.id)
        }
    }

    // Delete Child Category Mutation
    const deleteChildMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/admin/categories/${id}`),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ["categories"] })
            toast.success(data?.message || "تم حذف الفئة الفرعية بنجاح")
            setIsDeleteChildDialogOpen(false)
            setDeletingChild(null)
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || "فشل حذف الفئة الفرعية"
            toast.error(errorMessage)
        },
    })

    const handleDeleteChild = (child: Category) => {
        setDeletingChild(child)
        setIsDeleteChildDialogOpen(true)
    }

    const handleDeleteChildConfirm = () => {
        if (deletingChild) {
            deleteChildMutation.mutate(deletingChild.id)
        }
    }



    const handleEditProperty = (property: CategoryProperty) => {
        setEditingProperty(property)
        setIsPropertyDrawerOpen(true)
    }

    const handleAddProperty = () => {
        setEditingProperty(null)
        setIsPropertyDrawerOpen(true)
    }

    const handleEditFeature = (feature: CategoryFeature) => {
        setEditingFeature(feature)
        setIsFeatureDrawerOpen(true)
    }

    const handleAddFeature = () => {
        setEditingFeature(null)
        setIsFeatureDrawerOpen(true)
    }

    const handleEditChild = (child: Category) => {
        setEditingChild(child)
        setIsChildFormDrawerOpen(true)
    }

    const handleAddChild = () => {
        setEditingChild(null)
        setIsChildFormDrawerOpen(true)
    }

    const handleCloseChildFormDrawer = () => {
        setIsChildFormDrawerOpen(false)
        setEditingChild(null)
    }

    const handleCreateCategory = () => {
        setIsCategoryFormOpen(true)
    }

    if (!category) {
        return (
            <>
                <CategoryFormDrawer
                    open={isCategoryFormOpen}
                    onOpenChange={setIsCategoryFormOpen}
                    category={null}
                />
                <aside className="col-span-1 lg:col-span-2 w-full border-r bg-card flex justify-center items-center lg:block overflow-y-auto my-6" dir="rtl">
                    <div className="p-8 flex flex-col items-center justify-center">
                        {/* Icon with gradient background */}
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl blur-xl" />
                            <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
                                <FolderTree className="w-16 h-16 text-primary" />
                            </div>
                        </div>

                        {/* Title and Description */}
                        <div className="text-center space-y-3 mb-8 max-w-md">
                            <h3 className="text-xl font-bold text-foreground">لا توجد فئة محددة</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                اختر فئة من القائمة الجانبية لعرض تفاصيلها وإدارتها، أو أنشئ فئة جديدة للبدء
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                            <Button
                                onClick={handleCreateCategory}
                                className="flex-1 gap-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                                size="lg"
                            >
                                <Plus className="w-5 h-5" />
                                <span>إنشاء تصنيف جديد</span>
                            </Button>
                        </div>

                        {/* Quick Tips */}
                        <div className="mt-8 w-full max-w-md">
                            <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <Sparkles className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <h4 className="text-sm font-semibold text-foreground">نصائح سريعة</h4>
                                        <ul className="text-xs text-muted-foreground space-y-1.5 list-none">
                                            <li className="flex items-start gap-2">
                                                <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-primary" />
                                                <span>يمكنك إنشاء فئات رئيسية وفرعية</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-primary" />
                                                <span>أضف خصائص ومميزات لكل فئة</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-primary" />
                                                <span>رتب الفئات حسب الأهمية</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </>
        )
    }

    const renderPropertyIcon = (icon: string | null | undefined) => {
        if (icon) {
            const iconUrl = icon.startsWith('http')
                ? icon
                : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'https://ajar-backend.mystore.social'}/storage/${icon}`
            return (
                <Images
                    src={iconUrl}
                    alt=""
                    fill={false}
                    width={20}
                    height={20}
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
                <Images
                    src={iconUrl}
                    alt=""
                    fill={false}
                    width={20}
                    height={20}
                    className="w-5 h-5 object-cover rounded"
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
    console.log(category.properties)

    return (
        <>
            <CategoryFormDrawer
                open={isCategoryFormOpen}
                onOpenChange={setIsCategoryFormOpen}
                category={category}
            />

            {category && (
                <>
                    <PropertyFormDrawer
                        open={isPropertyDrawerOpen}
                        onOpenChange={setIsPropertyDrawerOpen}
                        categoryId={category.id}
                        property={editingProperty}
                    />
                    <FeatureFormDrawer
                        open={isFeatureDrawerOpen}
                        onOpenChange={setIsFeatureDrawerOpen}
                        categoryId={category.id}
                        feature={editingFeature}
                    />
                    <ChildCategoryFormDrawer
                        open={isChildFormDrawerOpen}
                        onOpenChange={handleCloseChildFormDrawer}
                        parentId={category.id}
                        child={editingChild}
                    />
                </>
            )}

            {/* Delete Category Confirmation Dialog */}
            {category && (
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent dir="rtl">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <Trash2 className="w-5 h-5 text-destructive" />
                                حذف التصنيف
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                هل أنت متأكد من حذف التصنيف "{category.name.ar || category.name.en}"؟
                                هذا الإجراء لا يمكن التراجع عنه.
                                {category.listings_count > 0 && (
                                    <span className="block mt-2 text-destructive font-semibold">
                                        تحذير: هذا التصنيف يحتوي على {category.listings_count} إعلان. سيتم حذفها أيضاً.
                                    </span>
                                )}
                                {category.children && category.children.length > 0 && (
                                    <span className="block mt-2 text-destructive font-semibold">
                                        تحذير: هذا التصنيف يحتوي على {category.children.length} فئة فرعية. سيتم حذفها أيضاً.
                                    </span>
                                )}
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <div className="rounded-lg border bg-muted/50 p-3">
                            <p className="text-sm font-medium">{category.name.ar || category.name.en}</p>
                            {category.description && (category.description.ar || category.description.en) && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    {category.description.ar || category.description.en}
                                </p>
                            )}
                        </div>

                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={deleteMutation.isPending}>
                                إلغاء
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteConfirm}
                                disabled={deleteMutation.isPending}
                                className="bg-destructive text-white hover:bg-destructive/90"
                            >
                                {deleteMutation.isPending ? "جاري الحذف..." : "حذف"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            {/* Delete Property Confirmation Dialog */}
            <AlertDialog open={isDeletePropertyDialogOpen} onOpenChange={setIsDeletePropertyDialogOpen}>
                <AlertDialogContent dir="rtl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-destructive" />
                            حذف الخاصية
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            هل أنت متأكد من حذف الخاصية "{deletingProperty?.name.ar || deletingProperty?.name.en}"؟
                            هذا الإجراء لا يمكن التراجع عنه.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {deletingProperty && (
                        <div className="rounded-lg border bg-muted/50 p-3">
                            <p className="text-sm font-medium">{deletingProperty.name.ar || deletingProperty.name.en}</p>
                            {deletingProperty.description && (deletingProperty.description.ar || deletingProperty.description.en) && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    {deletingProperty.description.ar || deletingProperty.description.en}
                                </p>
                            )}
                        </div>
                    )}

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deletePropertyMutation.isPending}>
                            إلغاء
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeletePropertyConfirm}
                            disabled={deletePropertyMutation.isPending}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            {deletePropertyMutation.isPending ? "جاري الحذف..." : "حذف"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Feature Confirmation Dialog */}
            <AlertDialog open={isDeleteFeatureDialogOpen} onOpenChange={setIsDeleteFeatureDialogOpen}>
                <AlertDialogContent dir="rtl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-destructive" />
                            حذف المميزة
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            هل أنت متأكد من حذف المميزة "{deletingFeature?.name.ar || deletingFeature?.name.en}"؟
                            هذا الإجراء لا يمكن التراجع عنه.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {deletingFeature && (
                        <div className="rounded-lg border bg-muted/50 p-3">
                            <p className="text-sm font-medium">{deletingFeature.name.ar || deletingFeature.name.en}</p>
                            {deletingFeature.description && (deletingFeature.description.ar || deletingFeature.description.en) && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    {deletingFeature.description.ar || deletingFeature.description.en}
                                </p>
                            )}
                        </div>
                    )}

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteFeatureMutation.isPending}>
                            إلغاء
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteFeatureConfirm}
                            disabled={deleteFeatureMutation.isPending}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            {deleteFeatureMutation.isPending ? "جاري الحذف..." : "حذف"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Child Category Confirmation Dialog */}
            <AlertDialog open={isDeleteChildDialogOpen} onOpenChange={setIsDeleteChildDialogOpen}>
                <AlertDialogContent dir="rtl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-destructive" />
                            حذف الفئة الفرعية
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            هل أنت متأكد من حذف الفئة الفرعية "{deletingChild?.name.ar || deletingChild?.name.en}"؟
                            هذا الإجراء لا يمكن التراجع عنه.
                            {deletingChild && deletingChild.listings_count > 0 && (
                                <span className="block mt-2 text-destructive font-semibold">
                                    تحذير: هذه الفئة تحتوي على {deletingChild.listings_count} إعلان. سيتم حذفها أيضاً.
                                </span>
                            )}
                            {deletingChild && deletingChild.children && deletingChild.children.length > 0 && (
                                <span className="block mt-2 text-destructive font-semibold">
                                    تحذير: هذه الفئة تحتوي على {deletingChild.children.length} فئة فرعية. سيتم حذفها أيضاً.
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {deletingChild && (
                        <div className="rounded-lg border bg-muted/50 p-3">
                            <p className="text-sm font-medium">{deletingChild.name.ar || deletingChild.name.en}</p>
                            {deletingChild.description && (deletingChild.description.ar || deletingChild.description.en) && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    {deletingChild.description.ar || deletingChild.description.en}
                                </p>
                            )}
                        </div>
                    )}

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteChildMutation.isPending}>
                            إلغاء
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteChildConfirm}
                            disabled={deleteChildMutation.isPending}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            {deleteChildMutation.isPending ? "جاري الحذف..." : "حذف"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

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
                                    {/* Add Button */}
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={handleAddProperty}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        إضافة خاصية جديدة
                                    </Button>

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
                                                                className="h-7 w-7 p-0"
                                                            >
                                                                <Edit className="w-3 h-3" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteProperty(property)}
                                                                className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
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
                                        <div className="text-center py-8">
                                            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                                            <p className="text-sm text-muted-foreground">لا توجد خصائص</p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            {/* Features Tab */}
                            <TabsContent value="features" className="mt-0">
                                <div className="space-y-4">
                                    {/* Add Button */}
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={handleAddFeature}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        إضافة مميزة جديدة
                                    </Button>

                                    {/* Features List */}
                                    {category.features && category.features.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-2">
                                            {category.features.map((feature: CategoryFeature) => (
                                                <div
                                                    key={feature.id}
                                                    className="border rounded-lg flex flex-row gap-4 items-center justify-start p-2 bg-muted/30 hover:bg-muted/50 transition-colors text-center relative group"
                                                >
                                                    <div className="absolute top-1 left-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 w-7 p-0"
                                                            onClick={() => handleEditFeature(feature)}
                                                        >
                                                            <Edit className="w-3 h-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => handleDeleteFeature(feature)}
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                    {feature.icon && (
                                                        <div className="flex justify-center mb-2">
                                                            <Images
                                                                src={feature?.icon}
                                                                alt=""
                                                                fill={false}
                                                                width={20}
                                                                height={20}
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
                                        <div className="text-center py-8">
                                            <Star className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                                            <p className="text-sm text-muted-foreground">لا توجد مميزات</p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            {/* Children Tab */}
                            <TabsContent value="children" className="mt-0">
                                <div className="space-y-4">
                                    {/* Add Button */}
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={handleAddChild}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        إضافة فئة فرعية جديدة
                                    </Button>

                                    {/* Children List */}
                                    {category.children && category.children.length > 0 ? (
                                        <div className="space-y-1">
                                            {category.children.map((child) => (
                                                <div
                                                    key={child.id}
                                                    className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 text-sm hover:bg-muted/50 transition-colors group"
                                                >
                                                    {child.icon && (
                                                        <Images
                                                            src={child.icon.startsWith('http')
                                                                ? child.icon
                                                                : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'https://ajar-backend.mystore.social'}/storage/${child.icon}`}
                                                            alt=""
                                                            fill={false}
                                                            width={20}
                                                            height={20}
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
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => handleDeleteChild(child)}
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <FolderTree className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                                            <p className="text-sm text-muted-foreground">لا توجد فئات فرعية</p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>

                        {/* Metadata */}
                        <div className="pt-4 mt-6 border-t">
                            <div className="space-y-2 text-xs text-muted-foreground *:" dir="rtl">
                                <div className="flex justify-between">
                                    <span>تاريخ الإنشاء:</span>
                                    <span>{new Date(category.created_at).toLocaleDateString('en-US')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>آخر تحديث:</span>
                                    <span>{new Date(category.updated_at).toLocaleDateString('en-US')}</span>
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
        </>
    )
}

