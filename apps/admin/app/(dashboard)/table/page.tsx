'use client'

import * as React from 'react'
import { TableCore, TableColumn, TableFilter } from './core'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

// Category data type for hierarchical structure
interface Category {
  id: number
  name: {
    ar: string
    en: string
  }
  description: {
    ar: string | null
    en: string | null
  }
  parent_id: number | null
  icon: string | null
  properties_source: string
  sort_order: number
  is_visible: boolean
  listings_count: number
  children?: Category[]
  properties?: Property[]
}

interface Property {
  id: number
  category_id: number
  name: {
    ar: string
    en: string
  }
  description: {
    ar: string | null
    en: string | null
  }
  icon: string | null
  type: string // نوع البيانات: int, float, text, select, etc.
  is_filter: boolean // هل يمكن التصفية به
  options: any | null
  sort_order: number
  created_at: string
  updated_at: string
}

// Listing data type based on API response
interface Listing {
  id: number
  title: {
    ar: string
    en: string
  }
  price: number
  currency: string
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  available_from: string
  available_until: string
  type: 'sale' | 'rent' | 'exchange'
  pay_every: string | null
  insurance: number | null
  is_featured: boolean
  views_count: number
  is_favorite: boolean
  favorites_count: number
  average_rating: number
  reviews_count: number
  cover_image: string
  category: {
    id: number
    name: {
      ar: string
      en: string
    }
  }
  governorate: {
    id: number
    name: {
      ar: string
      en: string
    }
  } | null
  city: {
    id: number
    name: {
      ar: string
      en: string
    }
  } | null
  created_at: string
  updated_at: string
}
export default function TableDemoPage() {
  const locale = "ar"

  // Category columns configuration for hierarchical table
  const categoryColumns: TableColumn<Category>[] = [
    {
      key: 'name',
      label: locale === 'ar' ? 'اسم الفئة' : 'Category Name',
      sortable: true,
      expandable: true,
      width: 'min-w-[200px]',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-base">
            {value?.[locale as 'ar' | 'en'] || value?.ar || value?.en || '-'}
          </span>
          {row.children && row.children.length > 0 && (
            <Badge variant="outline" className="text-xs font-mono">
              {row.children.length} {locale === 'ar' ? 'فرعية' : 'subcategories'}
            </Badge>
          )}
        </div>
      ),
      // children: (value, row) => (...)
    },
    {
      key: 'listings_count',
      label: locale === 'ar' ? 'عدد الإعلانات' : 'Listings Count',
      sortable: true,
      width: 'w-32',
      render: (value) => (
        <Badge
          variant={value > 0 ? 'default' : 'secondary'}
          className="font-mono"
        >
          {new Intl.NumberFormat(locale).format(value || 0)}
        </Badge>
      ),
    },
    {
      key: 'properties',
      label: locale === 'ar' ? 'عدد الخصائص' : 'Properties Count',
      width: 'w-32',
      render: (value) => {
        const count = Array.isArray(value) ? value.length : 0
        return (
          <Badge
            variant={count > 0 ? 'default' : 'outline'}
            className="font-mono bg-blue-500"
          >
            📋 {count}
          </Badge>
        )
      },
    },
    {
      key: 'properties_source',
      label: locale === 'ar' ? 'مصدر الخصائص' : 'Properties Source',
      width: 'w-44',
      render: (value) => {
        const sourceConfig: Record<string, { label: string; color: string }> = {
          custom: {
            label: locale === 'ar' ? '✨ مخصص' : '✨ Custom',
            color: 'bg-purple-500/10 text-purple-700 border-purple-300'
          },
          parent_and_custom: {
            label: locale === 'ar' ? '🔗 موروث ومخصص' : '🔗 Parent & Custom',
            color: 'bg-blue-500/10 text-blue-700 border-blue-300'
          },
          parent: {
            label: locale === 'ar' ? '⬆️ موروث' : '⬆️ Parent',
            color: 'bg-green-500/10 text-green-700 border-green-300'
          },
        }
        const config = sourceConfig[value] || { label: value, color: '' }
        return (
          <Badge variant="outline" className={`${config.color}`}>
            {config.label}
          </Badge>
        )
      },
    },
    {
      key: 'is_visible',
      label: locale === 'ar' ? 'الحالة' : 'Status',
      width: 'w-24',
      render: (value) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? (
            <>
              <span className="mr-1">✓</span>
              {locale === 'ar' ? 'مفعّل' : 'Active'}
            </>
          ) : (
            <>
              <span className="mr-1">✕</span>
              {locale === 'ar' ? 'معطّل' : 'Inactive'}
            </>
          )}
        </Badge>
      ),
    },
  ]

  // Custom render for expanded content - showing properties
  const renderExpandedContent = (category: Category) => {
    const hasProperties = category.properties && category.properties.length > 0
    const hasChildren = category.children && category.children.length > 0

    if (!hasProperties && !hasChildren) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">
            {locale === 'ar'
              ? 'لا توجد خصائص أو فئات فرعية لهذه الفئة'
              : 'No properties or subcategories for this category'}
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {/* Properties Section */}
        {hasProperties && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-primary flex items-center gap-2">
                <span>📋</span>
                {locale === 'ar' ? 'الخصائص المخصصة' : 'Custom Properties'}
                <Badge variant="outline" className="font-mono text-xs">
                  {category.properties!.length}
                </Badge>
              </h4>
              <div className="flex gap-1">
                <Badge variant="secondary" className="text-xs">
                  {category.properties!.filter(p => p.is_filter).length} {locale === 'ar' ? 'قابل للتصفية' : 'filterable'}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {category.properties!.map((prop, index) => (
                <div
                  key={prop.id}
                  className="border rounded-lg p-3 bg-gradient-to-br from-card to-muted/20 hover:shadow-md transition-all hover:scale-[1.02]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {prop.name?.[locale as 'ar' | 'en'] || prop.name?.ar}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs font-mono shrink-0">
                      #{prop.id}
                    </Badge>
                  </div>

                  {prop.description?.[locale as 'ar' | 'en'] && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {prop.description[locale as 'ar' | 'en']}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1 mt-2">
                    <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-950">
                      <span className="mr-1">🏷️</span>
                      {prop.type}
                    </Badge>
                    {prop.is_filter && (
                      <Badge variant="secondary" className="text-xs bg-green-50 dark:bg-green-950">
                        <span className="mr-1">🔍</span>
                        {locale === 'ar' ? 'فلتر' : 'Filter'}
                      </Badge>
                    )}
                    {prop.options && (
                      <Badge variant="default" className="text-xs bg-purple-500">
                        <span className="mr-1">📝</span>
                        {locale === 'ar' ? 'خيارات' : 'Options'}
                      </Badge>
                    )}
                  </div>

                  <div className="mt-2 pt-2 border-t flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {locale === 'ar' ? 'الترتيب:' : 'Order:'} {prop.sort_order}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Section */}
        {hasChildren && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <span className="font-semibold">💡 {locale === 'ar' ? 'معلومة:' : 'Info:'}</span>{' '}
              {locale === 'ar'
                ? `هذه الفئة تحتوي على ${category.children!.length} فئة فرعية. قم بطي الصف الرئيسي لرؤيتها.`
                : `This category has ${category.children!.length} subcategories. Collapse the main row to see them.`}
            </p>
          </div>
        )}
      </div>
    )
  }

  // Actions handlers
  const handleView = (category: Category) => {
    const name = category.name?.[locale as 'ar' | 'en'] || category.name?.ar
    toast.info(
      locale === 'ar' ? `عرض الفئة: ${name}` : `Viewing category: ${name}`,
      {
        description: `ID: ${category.id} | ${locale === 'ar' ? 'الإعلانات' : 'Listings'}: ${category.listings_count}`,
      }
    )
  }

  const handleEdit = (category: Category) => {
    const name = category.name?.[locale as 'ar' | 'en'] || category.name?.ar
    toast.success(
      locale === 'ar' ? `تعديل الفئة: ${name}` : `Editing category: ${name}`,
      {
        description: locale === 'ar' ? 'سيتم فتح نافذة التعديل' : 'This would open an edit dialog',
      }
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {locale === 'ar' ? 'إدارة الفئات (عرض شجري)' : 'Categories Management (Tree View)'}
            </h1>
            <p className="text-muted-foreground">
              {locale === 'ar'
                ? 'جدول هرمي يدعم التوسع والطي لعرض الفئات الفرعية والخصائص المخصصة'
                : 'Hierarchical table with expandable rows to show subcategories and custom properties'}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="h-fit px-4 py-2">
              <span className="text-xs text-muted-foreground mr-2">
                {locale === 'ar' ? 'إجمالي الفئات:' : 'Total Categories:'}
              </span>
              <span className="font-bold text-sm">-</span>
            </Badge>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-purple-500/10 text-purple-700 border-purple-300">
              ✨ {locale === 'ar' ? 'مخصص' : 'Custom'}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {locale === 'ar' ? 'خصائص مخصصة فقط' : 'Custom properties only'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-300">
              🔗 {locale === 'ar' ? 'موروث ومخصص' : 'Parent & Custom'}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {locale === 'ar' ? 'خصائص موروثة ومخصصة' : 'Inherited and custom properties'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-300">
              ⬆️ {locale === 'ar' ? 'موروث' : 'Parent'}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {locale === 'ar' ? 'خصائص موروثة من الفئة الأم' : 'Properties inherited from parent'}
            </span>
          </div>
        </div>
      </div>

      <TableCore<Category>
        columns={categoryColumns}
        apiEndpoint="/admin/categories"
        enableTreeView={true}
        treeViewSidebarWidth="350px"
        expandedRowKey="children"
        renderTreeViewContent={renderExpandedContent}
        treeViewItemRender={(category) => (
          <div className="space-y-1">
            <div className="font-semibold">
              {category.name?.[locale as 'ar' | 'en'] || category.name?.ar}
            </div>
            <div className="text-xs text-muted-foreground flex gap-2">
              <span>📋 {category.children?.length || 0}</span>
              <span>🏷️ {category.listings_count}</span>
            </div>
          </div>
        )}
        enableActions={true}
        actions={{ onView: handleView, onEdit: handleEdit }}
        enableDelete={false}
        enableEdit={false}
        enableSortOrder={false}
        searchPlaceholder={
          locale === 'ar' ? 'البحث في الفئات...' : 'Search categories...'
        }
        emptyMessage={
          locale === 'ar'
            ? 'لا توجد فئات. حاول تعديل الفلاتر.'
            : 'No categories found. Try adjusting your filters.'
        }
      />
    </div>
  )
}

