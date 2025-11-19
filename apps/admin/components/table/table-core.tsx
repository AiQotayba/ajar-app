"use client"

import * as React from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import {
  Search,
  X,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Trash2,
  Eye,
  Edit,
  CalendarIcon,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { toast } from "sonner"
import { api } from "@/lib/api-client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Pagination as PaginationUI,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { cn } from "@/lib/utils"

// Types
export interface TableColumn<T = any> {
  key: string
  label: string
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, row: T) => React.ReactNode
  className?: string
  width?: string // يمكن استخدام: "100px", "w-32", "20%", "auto", "min-w-[200px]"
}

export interface TableFilter {
  key: string
  label: string
  type: "text" | "select" | "dateRange"
  options?: { label: string; value: string }[]
}

export interface TableConfig<T = any> {
  columns: TableColumn<T>[]
  filters?: TableFilter[]
  data?: T[]
  apiEndpoint: string
  enableDragDrop?: boolean
  enableActions?: boolean
  actions?: {
    onView?: (row: T) => void
    onEdit?: (row: T) => void
  }
  searchPlaceholder?: string
  emptyMessage?: string
  enableDelete?: boolean
  enableEdit?: boolean
  enableView?: boolean
  enableDateRange?: boolean
  skeletonRows?: number
  skeletonVariant?: "default" | "compact" | "comfortable"
  testMode?: boolean
  enableSortOrder?: boolean
  // Delete dialog props
  deleteTitle?: string
  deleteDescription?: (row: T) => string
  deleteWarning?: (row: T) => string | null
  onDeleteConfirm?: (row: T) => Promise<void> | void
}

interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

// Hook for table data management with React Query
function useTableData<T>(apiEndpoint: string) {
  const searchParams = useSearchParams()
  const [localData, setLocalData] = React.useState<T[]>([])

  // Build query key from search params
  const queryKey = React.useMemo(() => {
    const params = Object.fromEntries(searchParams.entries())
    return ["table-data", apiEndpoint, params]
  }, [apiEndpoint, searchParams])
  console.log(queryKey);

  // Fetch function using API client
  const fetchData = React.useCallback(async () => {
    const params = Object.fromEntries(searchParams.entries())

    // Add default sort values if not present
    if (!params.sort_field && !params.sort_order) {
      params.sort_field = "sort_order"
      params.sort_order = "asc"
    }

    const response = await api.get(apiEndpoint, { params }) // Removed showErrorToast: true

    if (response.isError) throw new Error(response.message || "فشل في تحميل البيانات") // Changed error message to Arabic

    return response
  }, [apiEndpoint, searchParams])

  // Use React Query
  const {
    data: queryData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: fetchData,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  })

  // Extract data and pagination from API response
  const data = React.useMemo(() => {
    if (localData.length > 0) return localData

    // API returns { isError, data: [...], pagination: {...}, ... }
    const apiData = (queryData as any)?.data
    if (Array.isArray(apiData)) return apiData as T[]

    return []
  }, [queryData, localData])

  const pagination: PaginationMeta = React.useMemo(() => {
    // Access meta from the root level of ApiResponse
    const metaData = (queryData as any)?.meta
    return (
      metaData || {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
      }
    )
  }, [queryData])

  // Function to update local data (for drag & drop)
  const setData = React.useCallback(
    (newData: T[] | ((prev: T[]) => T[])) => {
      if (typeof newData === "function") {
        const apiData = (queryData as any)?.data
        const currentData = Array.isArray(apiData) ? (apiData as T[]) : []
        setLocalData((prev) => newData(prev.length > 0 ? prev : currentData))
      } else {
        setLocalData(newData)
      }
    },
    [queryData],
  )

  return { data, setData, isLoading, error, pagination, refetch }
}

// TableSkeleton Component
interface TableSkeletonProps {
  columns: number
  rows?: number
  variant?: "default" | "compact" | "comfortable"
}

function TableSkeleton({ columns, rows = 5, variant = "default" }: TableSkeletonProps) {
  const config = {
    default: { headerHeight: "h-5", cellHeight: "h-10", padding: "p-4" },
    compact: { headerHeight: "h-4", cellHeight: "h-8", padding: "p-3" },
    comfortable: { headerHeight: "h-6", cellHeight: "h-12", padding: "p-5" },
  }[variant]

  // Widths for different column types (more realistic)
  const getColumnWidth = (index: number, total: number) => {
    if (index === 0) return "w-16" // ID column
    if (index === total - 1) return "w-24" // Actions column
    if (index === 1) return "flex-[2]" // Title column (wider)
    return "flex-1"
  }

  return (
    <div
      className="animate-in fade-in-50 duration-300"
      data-testid="table-skeleton"
      role="status"
      aria-label="جاري تحميل البيانات"
    >
      {" "}
      {/* Changed aria-label to Arabic */}
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b">
            {Array.from({ length: columns }).map((_, j) => (
              <TableHead key={`header-${j}`} className={getColumnWidth(j, columns)}>
                <div className="relative overflow-hidden rounded-lg">
                  <Skeleton
                    className={cn(
                      config.headerHeight,
                      "w-full rounded-lg",
                      "bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10", // Changed background to gradient
                    )}
                    data-testid={`skeleton-header-${j}`}
                  />
                  {/* Shimmer effect for header */}
                  <div
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 dark:via-white/20 to-transparent animate-shimmer rounded-lg"
                    style={{
                      animationDelay: `${j * 100}ms`,
                    }}
                  />
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRow
              key={`row-${i}`}
              className="hover:bg-transparent animate-in fade-in-50"
              data-testid={`skeleton-row-${i}`}
              style={{
                animationDelay: `${i * 80}ms`,
                animationDuration: "500ms",
              }}
            >
              {Array.from({ length: columns }).map((_, j) => {
                // Vary cell content for more realistic appearance
                const cellWidths = [
                  "w-3/4", // 75%
                  "w-full", // 100%
                  "w-4/5", // 80%
                  "w-5/6", // 83%
                ]
                const randomWidth = cellWidths[(i + j) % cellWidths.length]

                return (
                  <TableCell key={`cell-${i}-${j}`} className={getColumnWidth(j, columns)}>
                    <div className="relative overflow-hidden rounded-lg">
                      <Skeleton
                        className={cn(
                          config.cellHeight,
                          randomWidth,
                          "rounded-lg relative",
                          "bg-gradient-to-r from-muted via-muted/50 to-muted", // Changed background to gradient
                          // Special styling for different columns
                          j === 0 && "w-12 bg-primary/5", // ID
                          j === columns - 1 && "w-20 bg-primary/5", // Actions
                        )}
                        data-testid={`skeleton-cell-${i}-${j}`}
                      />
                      {/* Shimmer overlay effect */}
                      <div
                        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent animate-shimmer rounded-lg"
                        style={{
                          animationDelay: `${(i * columns + j) * 100}ms`,
                        }}
                      />
                    </div>
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* Loading indicator bar */}
      <div className="absolute inset-x-0 bottom-0 h-[3px] bg-muted overflow-hidden rounded-b-lg">
        {" "}
        {/* Changed bg color */}
        <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-primary/80 to-transparent animate-shimmer" />
      </div>
    </div>
  )
}

// Empty State Component
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="relative mb-4">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 blur-2xl animate-pulse opacity-50" />
        <div className="relative rounded-full bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 p-6 shadow-lg border border-border/50">
          <Search className="h-10 w-10 text-primary drop-shadow-sm" />
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-2 text-foreground">
        لا توجد نتائج
      </h3>
      <p className="text-sm text-muted-foreground max-w-md leading-relaxed">{message}</p>
    </div>
  )
}

// Main TableCore Component
export function TableCore<T extends Record<string, any>>({
  columns,
  data: initialData,
  filters = [],
  apiEndpoint,
  enableDragDrop = false,
  enableActions = true,
  actions,
  searchPlaceholder,
  emptyMessage = "لا توجد بيانات متاحة", // Changed empty message to Arabic
  enableDelete = true,
  enableEdit = true,
  enableView = true, // Added enableView prop
  enableDateRange = true,
  skeletonRows = 5,
  skeletonVariant = "default",
  enableSortOrder = true,
  deleteTitle = "تأكيد الحذف",
  deleteDescription,
  deleteWarning,
  onDeleteConfirm,
}: TableConfig<T>) {
  // const t = useTranslations('table') // Removed useTranslations
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const { data, setData, isLoading, pagination, refetch } = useTableData<T>(apiEndpoint)

  const [isDragEnabled, setIsDragEnabled] = React.useState(false)
  const [sortColumn, setSortColumn] = React.useState<string | null>(null)
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc" | null>(null)
  const [activeFilters, setActiveFilters] = React.useState<Record<string, any>>({})
  const [dateRange, setDateRange] = React.useState<{ from?: Date; to?: Date }>({})
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null)

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [selectedRow, setSelectedRow] = React.useState<T | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  // Update URL params
  const updateParams = React.useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })

      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  // Initialize sort and date range from URL params on mount
  React.useEffect(() => {
    const sortField = searchParams.get("sort_field")
    const sortOrder = searchParams.get("sort_order")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")

    // Set default sort values if not present (without updating URL)
    if (!sortField && !sortOrder) {
      setSortColumn("sort_order")
      setSortDirection("asc")
    } else if (sortField && sortOrder) {
      // Set sort from URL
      setSortColumn(sortField)
      setSortDirection(sortOrder as "asc" | "desc")
    }

    if (dateFrom || dateTo) {
      setDateRange({
        from: dateFrom ? new Date(dateFrom) : undefined,
        to: dateTo ? new Date(dateTo) : undefined,
      })
    }
  }, [])

  // Handle search
  const handleSearch = (value: string) => updateParams({ search: value || null, page: "1" })

  // Handle sort - 3 states: default -> asc -> desc -> default
  const handleSort = (columnKey: string) => {
    if (isDragEnabled) return

    let newDirection: "asc" | "desc" | null = null
    let newColumn: string | null = columnKey

    if (sortColumn === columnKey) {
      // Same column: cycle through states
      if (sortDirection === null || sortDirection === "asc") {
        newDirection = sortDirection === null ? "asc" : "desc"
      } else {
        // desc -> default (clear)
        newDirection = null
        newColumn = null
      }
    } else {
      // Different column: start with asc
      newDirection = "asc"
    }

    setSortColumn(newColumn)
    setSortDirection(newDirection)

    if (newDirection === null) {
      // Clear sorting
      updateParams({ sort_field: null, sort_order: null })
    } else {
      updateParams({ sort_field: columnKey, sort_order: newDirection })
    }
  }

  // Handle filter
  const handleFilter = (key: string, value: string) => {
    if (!value) {
      // إذا كانت القيمة فارغة، امسح الفلتر
      const newFilters = { ...activeFilters }
      delete newFilters[key]
      setActiveFilters(newFilters)
      updateParams({ [key]: null, page: "1" })
    } else {
      setActiveFilters((prev) => ({ ...prev, [key]: value }))
      updateParams({ [key]: value, page: "1" })
    }
  }

  // Handle date range
  const handleDateRange = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range) {
      setDateRange({})
      updateParams({
        dateFrom: null,
        dateTo: null,
        page: "1",
      })
      return
    }

    setDateRange(range)
    updateParams({
      dateFrom: range.from ? format(range.from, "yyyy-MM-dd") : null,
      dateTo: range.to ? format(range.to, "yyyy-MM-dd") : null,
      page: "1",
    })
  }

  // Handle pagination
  const handlePageChange = (page: number) => updateParams({ page: page.toString() })

  // Handle drag and drop
  const handleDragStart = (index: number) => setDraggedIndex(index)

  const handleDragOver = (e: React.DragEvent, index: number) => e.preventDefault()

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()

    if (draggedIndex === null || draggedIndex === dropIndex) return

    const items = Array.from(data)
    const [reorderedItem] = items.splice(draggedIndex, 1)
    items.splice(dropIndex, 0, reorderedItem)

    // Get the target item (the one we dropped on)
    const targetItem = data[dropIndex]

    // Update local state immediately for better UX
    setData(items)
    setDraggedIndex(null)

    try {
      // Call API to update sort order on server using the target item's ID
      console.info(`Updating sort order for item ${reorderedItem.id} to position of item ${targetItem.id}`)

      const response = await api.put(`${apiEndpoint}/${reorderedItem.id}/reorder?sort_field=sort_order&sort_order=asc`, {
        sort_order: targetItem.sort_order
      })

      console.info("Sort order update response:", response)
      toast.success("تم تحديث الترتيب بنجاح")

      // Refetch data to ensure consistency
      refetch()
    } catch (error: any) {
      console.error("Error updating sort order:", error)

      // Show more specific error message
      const errorMessage = error?.response?.data?.message || error?.message || "فشل في تحديث الترتيب"
      toast.error(errorMessage)

      // Revert local changes on error
      refetch()
    }
  }

  const handleDragEnd = () => setDraggedIndex(null)

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters({})
    setDateRange({})
    setSortColumn(null)
    setSortDirection(null)
    updateParams({
      search: null,
      sort_field: null,
      sort_order: null,
      dateFrom: null,
      dateTo: null,
      ...Object.fromEntries(filters.map((f) => [f.key, null])),
    })
  }

  // Handle delete click
  const handleDeleteClick = (row: T) => {
    setSelectedRow(row)
    setDeleteDialogOpen(true)
  }

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!selectedRow) return

    try {
      setIsDeleting(true)

      // If custom delete handler provided, use it
      if (onDeleteConfirm) {
        const result = await onDeleteConfirm(selectedRow)
        // onDeleteConfirm is responsible for showing toast message
      } else {
        // Default delete using API
        const deleteResponse = await api.delete(`${apiEndpoint}/${selectedRow.id}`)
        // Show message from API response
        if (deleteResponse.message) {
          toast.success(deleteResponse.message)
        } else {
          toast.success("تم الحذف بنجاح")
        }
      }

      // Refetch data after successful delete
      refetch()

      setDeleteDialogOpen(false)
      setSelectedRow(null)
    } catch (error) {
      toast.error("فشل الحذف")
    } finally {
      setIsDeleting(false)
    }
  }
  const defaultColumns: TableColumn<T>[] = [
    {
      key: "id",
      label: "الرقم",
      sortable: true,
      className: "font-mono text-sm",
      width: "w-14 ",
      render: (value) => (
        <div className="h-8 w-fit px-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
          <span className="text-xs font-bold text-primary">#{value}</span>
        </div>
      ),
    },
    // {
    //   key: "sort_order",
    //   label: "الترتيب",
    //   sortable: true,
    //   width: "w-12",
    //   render: (value) => (
    //     <span className="font-mono text-sm font-medium">{value}</span>
    //   ),
    // },
  ]
  let initColumns: TableColumn<T>[] = enableSortOrder ? defaultColumns : [defaultColumns[0]]
  initColumns = [...initColumns, ...columns]
  const hasActiveFilters = Object.keys(activeFilters).length > 0 || !!dateRange.from || !!dateRange.to
  return (
    <div className="space-y-4 bg-card rounded-3xl shadow-lg p-4 md:p-6 border border-border/50 relative overflow-hidden group">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Animated background elements */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse opacity-30" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-pulse opacity-30 delay-1000" />

      <div className="relative z-10">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
          <div className="flex flex-1 items-center gap-2 w-full">
            <div className="flex flex-col sm:flex-row w-full gap-2">
              <TableSearch
                searchValue={searchParams.get("search") || ""}
                placeholder={searchPlaceholder || "بحث..."} // Changed placeholder to Arabic
                onSearch={handleSearch}
              />
              <TableFilters
                filters={filters}
                activeFilters={activeFilters}
                dateRange={dateRange}
                hasActiveFilters={hasActiveFilters}
                onFilterChange={handleFilter}
                onDateRangeChange={handleDateRange}
                onClearFilters={clearFilters}
                enableDateRange={enableDateRange}
              />
            </div>

            {enableDragDrop && (
              <Button
                variant={isDragEnabled ? "default" : "outline"}
                size="icon"
                onClick={() => setIsDragEnabled(!isDragEnabled)}
                title={isDragEnabled ? "تعطيل السحب والإفلات" : "تفعيل السحب والإفلات"}
                className="shrink-0 transition-all duration-300 hover:scale-110 hover:shadow-lg"
              >
                <GripVertical className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-card overflow-hidden relative shadow-md border border-border/50 transition-all duration-300 hover:shadow-lg">
          {isLoading ? (
            <TableSkeleton
              columns={initColumns.length + (enableActions ? 1 : 0)}
              rows={skeletonRows}
              variant={skeletonVariant}
            />
          ) : data.length === 0 ? (
            <EmptyState message={emptyMessage} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 hover:from-primary/15 hover:via-primary/10 hover:to-accent/15 transition-all duration-300 border-b border-border/50">
                  {isDragEnabled && <TableHead className="w-12" />}
                  {initColumns.map((column) => (
                    <TableHead
                      key={column.key}
                      className={cn(
                        "text-sm font-semibold text-foreground transition-all duration-200",
                        column.sortable &&
                        !isDragEnabled &&
                        "cursor-pointer select-none hover:bg-primary/20 hover:scale-[1.02] transition-all duration-200",
                        column.width,
                        column.className,
                      )}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      <div className="flex items-center gap-2">
                        {column.label}
                        {column.sortable && !isDragEnabled && (
                          <div className="flex flex-col transition-all duration-200">
                            {sortColumn === column.key ? (
                              sortDirection === "asc" ? (
                                <ChevronUp className="h-4 w-4 text-primary animate-in zoom-in-95" />
                              ) : sortDirection === "desc" ? (
                                <ChevronDown className="h-4 w-4 text-primary animate-in zoom-in-95" />
                              ) : (
                                <div className="flex flex-col -space-y-1">
                                  <ChevronUp className="h-3 w-3 text-muted-foreground/50" />
                                  <ChevronDown className="h-3 w-3 text-muted-foreground/50" />
                                </div>
                              )
                            ) : (
                              <div className="flex flex-col -space-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <ChevronUp className="h-3 w-3 text-muted-foreground/50" />
                                <ChevronDown className="h-3 w-3 text-muted-foreground/50" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </TableHead>
                  ))}
                  {enableActions && (
                    <TableHead className="w-32 text-center text-sm font-semibold text-foreground">الإجراءات</TableHead>
                  )}
                  {/* Changed header text to Arabic and added styling */}
                </TableRow>
              </TableHeader>

              <TableBody>
                {data.map((row, index) => (
                  <TableRow
                    key={row.id || index}
                    draggable={isDragEnabled}
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-300",
                      "group/row",
                      isDragEnabled && "cursor-move",
                      draggedIndex === index && "opacity-50 scale-95",
                      index % 2 === 0 && "bg-muted/20",
                    )}
                  >
                    {isDragEnabled && (
                      <TableCell>
                        <GripVertical className="h-4 w-4 text-muted-foreground group-hover/row:text-primary transition-colors" />
                      </TableCell>
                    )}

                    {initColumns.map((column) => (
                      <TableCell key={column.key} className={cn(column.width, column.className, "transition-colors duration-200")}>
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </TableCell>
                    ))}

                    {enableActions && actions && (
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          {" "}
                          {/* Changed justify-center and gap */}
                          {enableView && actions.onView && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              title="عرض"
                              onClick={() => actions.onView!(row)}
                              className="hover:bg-primary/20 hover:text-primary hover:scale-110 hover:shadow-md transition-all duration-300"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {enableEdit && actions.onEdit && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              title="تعديل"
                              onClick={() => actions.onEdit!(row)}
                              className="hover:bg-primary/20 hover:text-primary hover:scale-110 hover:shadow-md transition-all duration-300"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {enableDelete && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              title="حذف"
                              onClick={() => handleDeleteClick(row)}
                              className="hover:bg-destructive/20 hover:text-destructive hover:scale-110 hover:shadow-md transition-all duration-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <TablePagination
          meta={pagination}
          isLoading={isLoading}
          hasData={data.length > 0}
          onPageChange={handlePageChange}
        />

        {/* Delete Dialog */}
        {selectedRow && (
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent className="bg-card border-border shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-foreground">{deleteTitle}</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {deleteDescription ? (
                    deleteDescription(selectedRow)
                  ) : (
                    "هل أنت متأكد من الحذف؟ لا يمكن التراجع عن هذا الإجراء."
                  )}
                  {deleteWarning && deleteWarning(selectedRow) && (
                    <span className="block mt-2 text-destructive font-semibold">
                      {deleteWarning(selectedRow)}
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex flex-row justify-end gap-2">
                <div className="flex !flex-row justify-end gap-2 w-full">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteDialogOpen(false)}
                    disabled={isDeleting}
                    className="transition-all duration-300 hover:scale-105 cursor-pointer"
                  >
                    إلغاء
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteConfirm}
                    disabled={isDeleting}
                    className="transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
                  >
                    {isDeleting ? "جاري الحذف..." : "حذف"}
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}

// Separate Pagination Component
interface TablePaginationProps {
  meta: PaginationMeta
  isLoading: boolean
  hasData: boolean
  onPageChange: (page: number) => void
}

// Separate Search Component
interface TableSearchProps {
  searchValue: string
  placeholder: string
  onSearch: (value: string) => void
}

function TableSearch({ searchValue, placeholder, onSearch }: TableSearchProps) {
  const [localValue, setLocalValue] = React.useState(searchValue)
  const timeoutRef = React.useRef<NodeJS.Timeout>(null)

  // Debounce search input
  const handleChange = (value: string) => {
    setLocalValue(value)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      onSearch(value)
    }, 300)
  }

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="relative w-full max-w-sm group/search">
      <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none transition-colors duration-200 group-focus-within/search:text-primary" />
      <Input
        value={localValue}
        placeholder={placeholder}
        onChange={(e) => handleChange(e.target.value)}
        className="pr-9 w-full transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
      />
      {localValue && (
        <Button
          variant="ghost"
          size="icon-sm"
          className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 transition-all duration-200 hover:scale-110 hover:bg-destructive/10 hover:text-destructive"
          onClick={() => {
            setLocalValue("")
            onSearch("")
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}

// Separate Filters Component
interface TableFiltersProps {
  filters: TableFilter[]
  activeFilters: Record<string, any>
  dateRange: { from?: Date; to?: Date }
  hasActiveFilters: boolean
  onFilterChange: (key: string, value: string) => void
  onDateRangeChange: (range: { from?: Date; to?: Date } | undefined) => void
  onClearFilters: () => void
  enableDateRange: boolean
}

function TableFilters({
  filters,
  activeFilters,
  dateRange,
  enableDateRange,
  hasActiveFilters,
  onFilterChange,
  onDateRangeChange,
  onClearFilters,
}: TableFiltersProps) {
  // const t = useTranslations('table') // Removed useTranslations

  if (filters.length === 0) return null

  const activeFilterCount = Object.keys(activeFilters).length + (dateRange.from || dateRange.to ? 1 : 0)

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 hover:bg-primary/20 hover:scale-105 hover:shadow-md transition-all duration-300 bg-transparent">
            <SlidersHorizontal className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
            <span>تصفية</span>
            {hasActiveFilters && (
              <Badge variant="default" className="ml-1 rounded-full px-2 py-0.5 text-xs bg-primary animate-in zoom-in-95">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 bg-card shadow-xl border-primary/20 rounded-2xl" align="end">
          {" "}
          {/* Changed background, added shadow and border */}
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="font-bold text-lg flex items-center gap-2">
                  {" "}
                  {/* Added font-bold, text-lg, and icon */}
                  <Sparkles className="h-5 w-5 text-primary" />
                  تصفية النتائج {/* Changed text to Arabic */}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {" "}
                  {/* Adjusted margin */}
                  اختر الفلاتر المناسبة لتحسين نتائج البحث {/* Changed text to Arabic */}
                </p>
              </div>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFilters}
                  className="h-8 hover:bg-destructive/20 hover:text-destructive hover:scale-105 transition-all duration-300"
                >
                  <X className="mr-1 h-3 w-3" />
                  مسح الكل
                </Button>
              )}
            </div>

            {/* Filter Items */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {filters.map((filter) => (
                <FilterItem
                  key={filter.key}
                  filter={filter}
                  value={activeFilters[filter.key]}
                  dateRange={dateRange}
                  onFilterChange={onFilterChange}
                  onDateRangeChange={onDateRangeChange}
                />
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

// Individual Filter Item Component
interface FilterItemProps {
  filter: TableFilter
  value: any
  dateRange: { from?: Date; to?: Date }
  onFilterChange: (key: string, value: string) => void
  onDateRangeChange: (range: { from?: Date; to?: Date } | undefined) => void
}

function FilterItem({ filter, value, dateRange, onFilterChange, onDateRangeChange }: FilterItemProps) {
  // const t = useTranslations('table') // Removed useTranslations

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {filter.label}
        </label>
        {value && filter.type === "select" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFilterChange(filter.key, "")}
            className="h-6 px-2 text-xs hover:bg-destructive/10 hover:text-destructive" // Added hover effect
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Select Filter */}
      {filter.type === "select" && filter.options && (
        <Select value={value || undefined} onValueChange={(val) => onFilterChange(filter.key, val)} dir="rtl">
          <SelectTrigger className="w-full">
            <SelectValue placeholder={`اختر ${filter.label}`} /> {/* Changed placeholder to Arabic */}
          </SelectTrigger>
          <SelectContent className="bg-card">
            {" "}
            {/* Changed background */}
            {filter.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Text Filter */}
      {filter.type === "text" && (
        <Input
          value={value || ""}
          onChange={(e) => onFilterChange(filter.key, e.target.value)}
          placeholder={`أدخل ${filter.label}`} // Changed placeholder to Arabic
          className="w-full"
        />
      )}

      {/* Date Range Filter */}
      {filter.type === "dateRange" && (
        <div className="space-y-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-right font-normal", // Changed text alignment
                  !dateRange.from && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="ml-2 h-4 w-4" /> {/* Changed icon margin */}
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "PPP", { locale: ar })} - {format(dateRange.to, "PPP", { locale: ar })}{" "}
                      {/* Added locale */}
                    </>
                  ) : (
                    format(dateRange.from, "PPP", { locale: ar }) // Added locale
                  )
                ) : (
                  "اختر نطاق التاريخ" // Changed placeholder to Arabic
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-card" align="start">
              {" "}
              {/* Changed background */}
              <Calendar
                mode="range"
                defaultMonth={dateRange.from}
                selected={
                  dateRange.from && dateRange.to
                    ? {
                      from: dateRange.from,
                      to: dateRange.to,
                    }
                    : undefined
                }
                onSelect={onDateRangeChange}
                numberOfMonths={2}
                locale={ar} // Added locale
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {(dateRange.from || dateRange.to) && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-8 hover:bg-destructive/10 hover:text-destructive" // Added hover effect
              onClick={() => onDateRangeChange(undefined)}
            >
              <X className="mr-2 h-3 w-3" />
              مسح {filter.label} {/* Changed text to Arabic */}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

function TablePagination({ meta, isLoading, hasData, onPageChange }: TablePaginationProps) {
  // const t = useTranslations('table') // Removed useTranslations

  if (isLoading || !hasData) return null

  const { current_page, last_page, per_page, total } = meta

  // Calculate visible page numbers
  const getVisiblePages = () => {
    const pages: (number | "ellipsis")[] = []
    const maxVisible = 7

    if (last_page <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= last_page; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (current_page > 3) {
        pages.push("ellipsis")
      }

      // Show pages around current page
      const start = Math.max(2, current_page - 1)
      const end = Math.min(last_page - 1, current_page + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (current_page < last_page - 2) {
        pages.push("ellipsis")
      }

      // Always show last page
      pages.push(last_page)
    }

    return pages
  }

  const visiblePages = getVisiblePages()
  const startItem = (current_page - 1) * per_page + 1
  const endItem = Math.min(current_page * per_page, total)

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 rounded-xl bg-gradient-to-r from-muted/30 to-muted/10 border border-border/30 sm:flex-row sm:items-center sm:justify-between">
      {/* Results Info */}
      <p className="text-sm text-muted-foreground flex flex-row items-center gap-2 font-medium">
        <span className="px-2 py-1 rounded-lg bg-primary/10 text-primary font-bold">
          {startItem}
        </span>
        <span>حتى</span>
        <span className="px-2 py-1 rounded-lg bg-primary/10 text-primary font-bold">
          {endItem}
        </span>
        <span>من</span>
        <span className="px-2 py-1 rounded-lg bg-accent/10 text-accent-foreground font-bold">
          {total}
        </span>
      </p>
      {/* Pagination Controls */}
      <PaginationUI>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => current_page > 1 && onPageChange(current_page - 1)}
              className={cn(
                current_page === 1 && "pointer-events-none opacity-50",
                "hover:bg-primary/20 hover:scale-105 hover:shadow-md transition-all duration-300",
              )}
            />
          </PaginationItem>

          {visiblePages.map((page, index) =>
            page === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => onPageChange(page)}
                  isActive={current_page === page}
                  className={cn(
                    current_page === page && "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/30 scale-105",
                    "hover:bg-primary/20 hover:scale-105 hover:shadow-md transition-all duration-300",
                  )}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() => current_page < last_page && onPageChange(current_page + 1)}
              className={cn(
                current_page === last_page && "pointer-events-none opacity-50",
                "hover:bg-primary/20 hover:scale-105 hover:shadow-md transition-all duration-300",
              )}
            />
          </PaginationItem>
        </PaginationContent>
      </PaginationUI>
    </div>
  )
}
