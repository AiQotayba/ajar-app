"use client"

import * as React from "react"
import { ArrowRight, Edit, Plus, Trash2, Eye, EyeOff, FolderTree, ListTree } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TableCore } from "@/components/table/table-core"
import type { Category, CategoryProperty, CategoryFeature } from "@/lib/types/category"
import { propertiesColumns } from "@/components/pages/properties/columns"
import { featuresColumns } from "@/components/pages/features/columns"

interface CategoryDetailViewProps {
    category: Category
    onEdit: (category: Category) => void
    onAddSubCategory: (parentCategory: Category) => void
    onDelete: (category: Category) => void
    onSelectChild: (child: Category) => void
    onBackToTable: () => void
    onPropertyAdd: () => void
    onPropertyEdit: (property: CategoryProperty) => void
    onPropertyDelete: (propertyId: number) => Promise<void>
    onFeatureAdd: () => void
    onFeatureEdit: (feature: CategoryFeature) => void
    onFeatureDelete: (featureId: number) => Promise<void>
}

export function CategoryDetailView({
    category,
    onEdit,
    onAddSubCategory,
    onDelete,
    onSelectChild,
    onBackToTable,
    onPropertyAdd,
    onPropertyEdit,
    onPropertyDelete,
    onFeatureAdd,
    onFeatureEdit,
    onFeatureDelete,
}: CategoryDetailViewProps) {
    return (
        <div className="flex h-full flex-col">
            {/* Header with Back Button */}
            <div className="border-b bg-card p-4">
                <Button variant="ghost" size="sm" onClick={onBackToTable} className="mb-4">
                    <ArrowRight className="h-4 w-4 ml-2" />
                    رجوع للجدول
                </Button>

                <div className="flex items-start justify-between gap-4">
                    {/* Category Info */}
                    <div className="flex items-start gap-4 flex-1">
                        {category.icon && (
                            <div className="h-16 w-16 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden shrink-0">
                                {category.icon.includes('/') || category.icon.includes('.') ? (
                                    <img 
                                        src={category.icon.startsWith('http') ? category.icon : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'https://ajar-backend.mystore.social'}/storage/${category.icon}`}
                                        alt={category.name.ar}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-3xl">{category.icon}</span>
                                )}
                            </div>
                        )}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-2xl font-bold">{category.name.ar}</h2>
                                <Badge
                                    variant={category.is_visible ? "default" : "secondary"}
                                    className={
                                        category.is_visible
                                            ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                            : "bg-muted"
                                    }
                                >
                                    {category.is_visible ? (
                                        <>
                                            <Eye className="h-3 w-3 mr-1" />
                                            ظاهرة
                                        </>
                                    ) : (
                                        <>
                                            <EyeOff className="h-3 w-3 mr-1" />
                                            مخفية
                                        </>
                                    )}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">{category.name.en}</p>
                            {category.description && (
                                <>
                                    <p className="text-sm mt-2">{category.description.ar}</p>
                                    <p className="text-xs text-muted-foreground">{category.description.en}</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => onEdit(category)}>
                            <Edit className="h-4 w-4 mr-2" />
                            تعديل
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => onDelete(category)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            حذف
                        </Button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-4 mt-4">
                    <div className="rounded-lg border bg-card p-3">
                        <div className="text-xs text-muted-foreground mb-1">نوع الفئة</div>
                        {category.parent_id === null ? (
                            <Badge variant="outline" className="w-fit">
                                <FolderTree className="h-3 w-3 mr-1" />
                                فئة رئيسية
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="w-fit">
                                <ListTree className="h-3 w-3 mr-1" />
                                فئة فرعية
                            </Badge>
                        )}
                    </div>
                    <div className="rounded-lg border bg-card p-3">
                        <div className="text-xs text-muted-foreground mb-1">عدد الإعلانات</div>
                        <div className="text-2xl font-bold text-blue-600">{category.listings_count}</div>
                    </div>
                    <div className="rounded-lg border bg-card p-3">
                        <div className="text-xs text-muted-foreground mb-1">الخصائص</div>
                        <div className="text-2xl font-bold text-purple-600">{category.properties.length}</div>
                    </div>
                    <div className="rounded-lg border bg-card p-3">
                        <div className="text-xs text-muted-foreground mb-1">الميزات</div>
                        <div className="text-2xl font-bold text-orange-600">{category.features.length}</div>
                    </div>
                </div>
            </div>

            {/* Tabs Content */}
            <div className="flex-1 overflow-hidden">
                <Tabs
                    defaultValue={category.parent_id === null ? "children" : "properties"}
                    className="h-full flex flex-col"
                >
                    <TabsList className="mx-4 mt-4">
                        {category.parent_id === null && (
                            <TabsTrigger value="children">
                                الفئات الفرعية ({category.children.length})
                            </TabsTrigger>
                        )}
                        <TabsTrigger value="properties">الخصائص ({category.properties.length})</TabsTrigger>
                        <TabsTrigger value="features">الميزات ({category.features.length})</TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-auto p-4">
                        {/* Children Tab */}
                        {category.parent_id === null && (
                            <TabsContent value="children" className="mt-0 space-y-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">الفئات الفرعية</h3>
                                    <Button variant="default" size="sm" onClick={() => onAddSubCategory(category)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        إضافة فئة فرعية
                                    </Button>
                                </div>

                                {category.children.length > 0 ? (
                                    <div className="rounded-lg border bg-card">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>الفئة الفرعية</TableHead>
                                                    <TableHead className="text-center w-32">عدد الإعلانات</TableHead>
                                                    <TableHead className="text-center w-32">الخصائص</TableHead>
                                                    <TableHead className="text-center w-32">الميزات</TableHead>
                                                    <TableHead className="text-center w-28">الحالة</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {category.children.map((child) => (
                                                    <TableRow
                                                        key={child.id}
                                                        className="cursor-pointer hover:bg-primary/5 transition-colors"
                                                        onClick={() => onSelectChild(child)}
                                                    >
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                {child.icon && (
                                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
                                                                        <span className="text-xl">{child.icon}</span>
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <div className="font-medium">{child.name.ar}</div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {child.name.en}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge variant="secondary">{child.listings_count}</Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge variant="outline">{child.properties.length}</Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge variant="outline">{child.features.length}</Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge
                                                                variant={child.is_visible ? "default" : "secondary"}
                                                                className={
                                                                    child.is_visible
                                                                        ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                                                        : ""
                                                                }
                                                            >
                                                                {child.is_visible ? "ظاهرة" : "مخفية"}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/10">
                                        <p className="text-sm mb-4">لا توجد فئات فرعية لهذه الفئة</p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onAddSubCategory(category)}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            إضافة أول فئة فرعية
                                        </Button>
                                    </div>
                                )}
                            </TabsContent>
                        )}

                        {/* Properties Tab */}
                        <TabsContent value="properties" className="mt-0">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">خصائص الفئة</h3>
                                <Button variant="default" size="sm" onClick={onPropertyAdd}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    إضافة خاصية
                                </Button>
                            </div>

                            {category.properties.length > 0 ? (
                                <TableCore<CategoryProperty>
                                    columns={propertiesColumns}
                                    apiEndpoint=""
                                    data={category.properties}
                                    enableDragDrop={false}
                                    enableActions={true}
                                    enableSortOrder={false}
                                    actions={{
                                        onEdit: onPropertyEdit,
                                    }}
                                    enableView={false}
                                    enableEdit={true}
                                    enableDelete={true}
                                    enableDateRange={false}
                                    searchPlaceholder="ابحث في الخصائص..."
                                    emptyMessage="لا توجد خصائص."
                                    skeletonRows={3}
                                    deleteTitle="تأكيد حذف الخاصية"
                                    deleteDescription={(prop) => `هل أنت متأكد من حذف الخاصية "${prop.name.ar}"؟`}
                                    onDeleteConfirm={(prop) => onPropertyDelete(prop.id)}
                                    testMode={true}
                                />
                            ) : (
                                <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/10">
                                    <p className="text-sm mb-4">لا توجد خصائص لهذه الفئة</p>
                                    <Button variant="outline" size="sm" onClick={onPropertyAdd}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        إضافة أول خاصية
                                    </Button>
                                </div>
                            )}
                        </TabsContent>

                        {/* Features Tab */}
                        <TabsContent value="features" className="mt-0">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">ميزات الفئة</h3>
                                <Button variant="default" size="sm" onClick={onFeatureAdd}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    إضافة ميزة
                                </Button>
                            </div>

                            {category.features.length > 0 ? (
                                <TableCore<CategoryFeature>
                                    columns={featuresColumns}
                                    apiEndpoint=""
                                    data={category.features}
                                    enableDragDrop={false}
                                    enableActions={true}
                                    enableSortOrder={false}
                                    actions={{
                                        onEdit: onFeatureEdit,
                                    }}
                                    enableView={false}
                                    enableEdit={true}
                                    enableDelete={true}
                                    enableDateRange={false}
                                    searchPlaceholder="ابحث في الميزات..."
                                    emptyMessage="لا توجد ميزات."
                                    skeletonRows={3}
                                    deleteTitle="تأكيد حذف الميزة"
                                    deleteDescription={(feature) => `هل أنت متأكد من حذف الميزة "${feature.name.ar}"؟`}
                                    onDeleteConfirm={(feature) => onFeatureDelete(feature.id)}
                                    testMode={true}
                                />
                            ) : (
                                <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/10">
                                    <p className="text-sm mb-4">لا توجد ميزات لهذه الفئة</p>
                                    <Button variant="outline" size="sm" onClick={onFeatureAdd}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        إضافة أول ميزة
                                    </Button>
                                </div>
                            )}
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    )
}
