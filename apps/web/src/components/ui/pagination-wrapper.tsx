"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"

interface PaginationWrapperProps {
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from?: number
    to?: number
  }
  className?: string
  showInfo?: boolean
  infoText?: string
}

export function PaginationWrapper({ 
  pagination, 
  className = "",
  showInfo = true,
  infoText
}: PaginationWrapperProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= pagination.last_page) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', page.toString())
      
      // Update URL with new page
      router.push(`?${params.toString()}`, { scroll: false })
    }
  }, [pagination.last_page, router, searchParams])

  const generatePageNumbers = () => {
    const { current_page, last_page } = pagination
    const pages = []
    const maxVisible = 5
    
    if (last_page <= maxVisible) {
      for (let i = 1; i <= last_page; i++) {
        pages.push(i)
      }
    } else {
      const start = Math.max(1, current_page - 2)
      const end = Math.min(last_page, start + maxVisible - 1)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
    }
    
    return pages
  }

  const renderPaginationItems = () => {
    const { current_page, last_page } = pagination
    const pageNumbers = generatePageNumbers()
    const items = []
    
    // Previous button
    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious 
          href="#"
          onClick={(e) => {
            e.preventDefault()
            handlePageChange(current_page - 1)
          }}
          className={current_page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
        />
      </PaginationItem>
    )
    
    // First page if not visible
    if (pageNumbers[0] > 1) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault()
              handlePageChange(1)
            }}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>
      )
      
      if (pageNumbers[0] > 2) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        )
      }
    }
    
    // Page numbers
    pageNumbers.forEach((page) => {
      items.push(
        <PaginationItem key={page}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault()
              handlePageChange(page)
            }}
            isActive={page === current_page}
            className="cursor-pointer"
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      )
    })
    
    // Last page if not visible
    if (pageNumbers[pageNumbers.length - 1] < last_page) {
      if (pageNumbers[pageNumbers.length - 1] < last_page - 1) {
        items.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        )
      }
      
      items.push(
        <PaginationItem key={last_page}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault()
              handlePageChange(last_page)
            }}
            className="cursor-pointer"
          >
            {last_page}
          </PaginationLink>
        </PaginationItem>
      )
    }
    
    // Next button
    items.push(
      <PaginationItem key="next">
        <PaginationNext 
          href="#"
          onClick={(e) => {
            e.preventDefault()
            handlePageChange(current_page + 1)
          }}
          className={current_page === last_page ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
        />
      </PaginationItem>
    )
    
    return items
  }

  if (pagination.last_page <= 1) return null

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Pagination Info */}
      {showInfo && (
        <div className="text-sm text-gray-600">
          {infoText || (() => {
            const from = pagination.from || ((pagination.current_page - 1) * pagination.per_page + 1)
            const to = pagination.to || Math.min(pagination.current_page * pagination.per_page, pagination.total)
            return `عرض ${from} إلى ${to} من ${pagination.total} نتيجة`
          })()}
        </div>
      )}

      {/* Pagination Controls */}
      <Pagination>
        <PaginationContent>
          {renderPaginationItems()}
        </PaginationContent>
      </Pagination>
    </div>
  )
}
