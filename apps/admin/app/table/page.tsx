'use client'

import * as React from 'react'
import { TableCore, TableColumn, TableFilter } from '@/components/table/table-core'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

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
  // Table columns configuration
  const columns: TableColumn<Listing>[] = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      className: 'font-mono text-muted-foreground text-sm',
    },
    {
      key: 'title',
      label: locale === 'ar' ? 'العنوان' : 'Title',
      sortable: true,
      render: (value) => (
        <span className="font-medium line-clamp-2">
          {value?.[locale as 'ar' | 'en'] || value?.ar || value?.en || '-'}
        </span>
      ),
    },
    {
      key: 'price',
      label: locale === 'ar' ? 'السعر' : 'Price',
      sortable: true,
      render: (value, row) => (
        <span className="font-semibold text-primary whitespace-nowrap">
          {new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: row.currency || 'USD',
            minimumFractionDigits: 0,
          }).format(value || 0)}
        </span>
      ),
    },
    {
      key: 'category',
      label: locale === 'ar' ? 'الفئة' : 'Category',
      sortable: true,
      render: (value) => (
        <Badge variant="outline">
          {value?.name?.[locale as 'ar' | 'en'] || '-'}
        </Badge>
      ),
    },
    {
      key: 'governorate',
      label: locale === 'ar' ? 'المحافظة' : 'Governorate',
      sortable: true,
      render: (value) => (
        <span className="text-sm">
          {value?.name?.[locale as 'ar' | 'en'] || '-'}
        </span>
      ),
    },
    {
      key: 'type',
      label: locale === 'ar' ? 'النوع' : 'Type',
      sortable: true,
      render: (value) => {
        const typeLabels = {
          sale: locale === 'ar' ? 'بيع' : 'Sale',
          rent: locale === 'ar' ? 'إيجار' : 'Rent',
          exchange: locale === 'ar' ? 'مقايضة' : 'Exchange',
        }
        return (
          <Badge variant="secondary">
            {typeLabels[value as keyof typeof typeLabels] || value}
          </Badge>
        )
      },
    },
    {
      key: 'status',
      label: locale === 'ar' ? 'الحالة' : 'Status',
      sortable: true,
      render: (value: Listing['status']) => {
        const statusConfig = {
          pending: {
            variant: 'secondary' as const,
            label: locale === 'ar' ? 'قيد المراجعة' : 'Pending',
          },
          approved: {
            variant: 'default' as const,
            label: locale === 'ar' ? 'موافق عليه' : 'Approved',
          },
          rejected: {
            variant: 'destructive' as const,
            label: locale === 'ar' ? 'مرفوض' : 'Rejected',
          },
          expired: {
            variant: 'outline' as const,
            label: locale === 'ar' ? 'منتهي' : 'Expired',
          },
        }

        const config = statusConfig[value] || statusConfig.pending

        return <Badge variant={config.variant}>{config.label}</Badge>
      },
    },
    {
      key: 'views_count',
      label: locale === 'ar' ? 'المشاهدات' : 'Views',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-muted-foreground">
          {new Intl.NumberFormat(locale).format(value || 0)}
        </span>
      ),
    },
    {
      key: 'is_featured',
      label: locale === 'ar' ? 'مميز' : 'Featured',
      render: (value) =>
        value ? (
          <Badge variant="default" className="bg-amber-500">
            ⭐ {locale === 'ar' ? 'مميز' : 'Featured'}
          </Badge>
        ) : null,
    },
  ]

  // Table filters configuration
  const filters: TableFilter[] = [
    {
      key: 'type',
      label: locale === 'ar' ? 'نوع الإعلان' : 'Listing Type',
      type: 'select',
      options: [
        { label: locale === 'ar' ? 'بيع' : 'Sale', value: 'sale' },
        { label: locale === 'ar' ? 'إيجار' : 'Rent', value: 'rent' },
        { label: locale === 'ar' ? 'مقايضة' : 'Exchange', value: 'exchange' },
      ],
    },
    {
      key: 'status',
      label: locale === 'ar' ? 'الحالة' : 'Status',
      type: 'select',
      options: [
        { label: locale === 'ar' ? 'قيد المراجعة' : 'Pending', value: 'pending' },
        { label: locale === 'ar' ? 'موافق عليه' : 'Approved', value: 'approved' },
        { label: locale === 'ar' ? 'مرفوض' : 'Rejected', value: 'rejected' },
        { label: locale === 'ar' ? 'منتهي' : 'Expired', value: 'expired' },
      ],
    },
    {
      key: 'is_featured',
      label: locale === 'ar' ? 'الإعلانات المميزة' : 'Featured Listings',
      type: 'select',
      options: [
        { label: locale === 'ar' ? 'مميز فقط' : 'Featured Only', value: '1' },
        { label: locale === 'ar' ? 'عادي فقط' : 'Regular Only', value: '0' },
      ],
    },
    {
      key: 'dateRange',
      label: locale === 'ar' ? 'نطاق التاريخ' : 'Date Range',
      type: 'dateRange',
    },
  ]

  // Actions handlers
  const handleView = (listing: Listing) => {
    const title = listing.title?.[locale as 'ar' | 'en'] || listing.title?.ar || listing.title?.en
    toast.info(
      locale === 'ar' ? `عرض الإعلان: ${title}` : `Viewing listing: ${title}`,
      {
        description: `ID: ${listing.id} | ${locale === 'ar' ? 'المشاهدات' : 'Views'}: ${listing.views_count}`,
      }
    )
  }

  const handleEdit = (listing: Listing) => {
    const title = listing.title?.[locale as 'ar' | 'en'] || listing.title?.ar || listing.title?.en
    toast.success(
      locale === 'ar' ? `تعديل الإعلان: ${title}` : `Editing listing: ${title}`,
      {
        description: locale === 'ar' ? 'سيتم فتح نافذة التعديل' : 'This would open an edit dialog',
      }
    )
  }

  const handleDelete = (listing: Listing) => {
    const title = listing.title?.[locale as 'ar' | 'en'] || listing.title?.ar || listing.title?.en
    toast.error(
      locale === 'ar' ? `حذف الإعلان: ${title}` : `Delete listing: ${title}`,
      {
        description: locale === 'ar' ? 'سيتم عرض نافذة تأكيد' : 'This would show a confirmation dialog',
        action: {
          label: locale === 'ar' ? 'تراجع' : 'Undo',
          onClick: () =>
            toast.info(locale === 'ar' ? 'تم إلغاء الحذف' : 'Deletion cancelled'),
        },
      }
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {locale === 'ar' ? 'إداره الإعلانات' : 'Listings Management'}
        </h1>
        <p className="text-muted-foreground">
          {locale === 'ar'
            ? 'جدول شامل مع البحث والتصفية والترتيب والسحب والإفلات والترقيم'
            : 'Comprehensive table with search, filtering, sorting, drag & drop, and pagination'}
        </p>
      </div>

      <TableCore<Listing>
        columns={columns}
        filters={filters}
        apiEndpoint="/user/listings"
        enableDragDrop={true}
        enableActions={true}
        actions={{ onView: handleView, onEdit: handleEdit }}
        enableEdit={false}
        enableDateRange={true}
        searchPlaceholder={
          locale === 'ar' ? 'البحث في الإعلانات...' : 'Search listings...'
        }
        emptyMessage={
          locale === 'ar'
            ? 'لا توجد إعلانات. حاول تعديل الفلاتر.'
            : 'No listings found. Try adjusting your filters.'
        }
      />
    </div>
  )
}

