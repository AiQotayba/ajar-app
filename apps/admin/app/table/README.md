# SmartDataTable Component

A comprehensive, feature-rich table component built with React, TypeScript, and Tailwind CSS. Designed for the Ajar real estate platform with full support for RTL/LTR layouts and internationalization.

## Features

### Core Features (Beta)
- ✅ **Client-Side Rendering (CSR)** - Fully client-side with dynamic data fetching
- ✅ **Search** - Real-time search across table data
- ✅ **Advanced Filtering** - Text, select, and date range filters
- ✅ **Column Sorting** - Click column headers to sort (disabled during drag mode)
- ✅ **Drag & Drop** - Native HTML5 drag and drop for row reordering
- ✅ **Skeleton Loading** - Beautiful loading states
- ✅ **Empty States** - User-friendly empty data display
- ✅ **Row Actions** - View, edit, and delete actions
- ✅ **Pagination** - Full pagination support with page info
- ✅ **URL State Management** - All filters and sorting reflected in URL params

### Design Features
- 🎨 **Fully Responsive** - Works on all screen sizes
- 🌍 **RTL/LTR Support** - Automatic direction support
- 🌐 **Internationalization** - Full i18n support with next-intl
- 🎯 **Accessible** - Built with accessibility in mind
- 🎭 **Dark Mode** - Supports light and dark themes
- ⚡ **Performance** - Optimized rendering and state management

## Installation

The component is already integrated into the Ajar web application. To use it in other pages:

```tsx
import { TableCore, TableColumn, TableFilter } from '@/app/[locale]/table/core'
```

## Usage

### Basic Example

```tsx
'use client'

import { TableCore, TableColumn } from '@/app/[locale]/table/core'

interface Product {
  id: number
  name: string
  price: number
}

const columns: TableColumn<Product>[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'price', label: 'Price', sortable: true },
]

export default function ProductsPage() {
  return (
    <TableCore
      columns={columns}
      apiEndpoint="/api/products"
      searchPlaceholder="Search products..."
    />
  )
}
```

### Advanced Example with All Features

```tsx
'use client'

import { TableCore, TableColumn, TableFilter } from '@/app/[locale]/table/core'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Property {
  id: number
  title: string
  price: number
  status: 'available' | 'sold' | 'rented'
}

const columns: TableColumn<Property>[] = [
  {
    key: 'id',
    label: 'ID',
    sortable: true,
    className: 'font-mono',
  },
  {
    key: 'title',
    label: 'Title',
    sortable: true,
    render: (value) => <span className="font-medium">{value}</span>,
  },
  {
    key: 'price',
    label: 'Price',
    sortable: true,
    render: (value) => `$${value.toLocaleString()}`,
  },
  {
    key: 'status',
    label: 'Status',
    render: (value) => <Badge>{value}</Badge>,
  },
]

const filters: TableFilter[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'All', value: '' },
      { label: 'Available', value: 'available' },
      { label: 'Sold', value: 'sold' },
      { label: 'Rented', value: 'rented' },
    ],
  },
  {
    key: 'dateRange',
    label: 'Date Range',
    type: 'dateRange',
  },
]

export default function PropertiesPage() {
  return (
    <TableCore
      columns={columns}
      filters={filters}
      apiEndpoint="/api/properties"
      enableDragDrop={true}
      enableActions={true}
      actions={{
        onView: (property) => {
          toast.info(`Viewing: ${property.title}`)
        },
        onEdit: (property) => {
          // Navigate to edit page or open modal
        },
        onDelete: (property) => {
          // Show confirmation dialog
        },
      }}
      searchPlaceholder="Search properties..."
      emptyMessage="No properties found"
    />
  )
}
```

## API Reference

### TableCore Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `columns` | `TableColumn[]` | Yes | Array of column configurations |
| `apiEndpoint` | `string` | Yes | API endpoint to fetch data from |
| `filters` | `TableFilter[]` | No | Array of filter configurations |
| `enableDragDrop` | `boolean` | No | Enable drag and drop reordering (default: false) |
| `enableActions` | `boolean` | No | Enable row actions dropdown (default: true) |
| `actions` | `ActionHandlers` | No | Action handler functions |
| `searchPlaceholder` | `string` | No | Placeholder for search input |
| `emptyMessage` | `string` | No | Message to display when no data |

### TableColumn

```typescript
interface TableColumn<T> {
  key: string                 // Key in the data object
  label: string               // Column header label
  sortable?: boolean          // Enable sorting for this column
  filterable?: boolean        // Enable filtering for this column
  render?: (value: any, row: T) => React.ReactNode  // Custom render function
  className?: string          // Additional CSS classes
}
```

### TableFilter

```typescript
interface TableFilter {
  key: string                 // Filter key for URL params
  label: string               // Filter label
  type: 'text' | 'select' | 'dateRange'  // Filter type
  options?: Array<{           // Options for select type
    label: string
    value: string
  }>
}
```

### ActionHandlers

```typescript
interface ActionHandlers<T> {
  onView?: (row: T) => void   // View action handler
  onEdit?: (row: T) => void   // Edit action handler
  onDelete?: (row: T) => void // Delete action handler
}
```

## API Response Format

The component expects the API to return data in the following format:

```typescript
{
  data: Array<T>,              // Array of data rows
  pagination: {
    total: number,             // Total number of items
    page: number,              // Current page number
    limit: number,             // Items per page
    totalPages: number         // Total number of pages
  }
}
```

## URL Parameters

The component automatically manages the following URL parameters:

- `search` - Search query string
- `sort` - Column key to sort by
- `order` - Sort order ('asc' or 'desc')
- `page` - Current page number
- `limit` - Items per page
- `dateFrom` - Date range start (YYYY-MM-DD)
- `dateTo` - Date range end (YYYY-MM-DD)
- Custom filter keys from your filter configuration

## Styling

The component uses Tailwind CSS and shadcn/ui components. It automatically supports:
- Light and dark themes
- RTL and LTR layouts
- Responsive breakpoints

## Translations

All user-facing text is internationalized. The component uses the `table` namespace in your translation files:

```json
{
  "table": {
    "search": "Search",
    "filter": "Filter",
    "actions": "Actions",
    "view": "View",
    "edit": "Edit",
    "delete": "Delete",
    ...
  }
}
```

## Best Practices

1. **Keep columns focused** - Don't add too many columns. Consider making some optional or hidden on mobile.

2. **Use custom render functions** - Format data appropriately for display:
   ```tsx
   {
     key: 'price',
     label: 'Price',
     render: (value) => new Intl.NumberFormat('en-US', {
       style: 'currency',
       currency: 'USD'
     }).format(value)
   }
   ```

3. **Implement server-side filtering** - The component sends all filter params to the API. Implement them server-side for better performance.

4. **Provide meaningful empty states** - Customize the empty message based on context:
   ```tsx
   emptyMessage="No properties match your search. Try adjusting your filters."
   ```

5. **Handle actions appropriately** - Use toast notifications for feedback:
   ```tsx
   onDelete: async (item) => {
     const confirmed = await showConfirmDialog()
     if (confirmed) {
       await deleteItem(item.id)
       toast.success('Item deleted')
       refetch()
     }
   }
   ```

## Testing

Test files are included. Run tests with:

```bash
npm test core.test.tsx
```

## Future Enhancements

Planned features for future releases:
- Multi-select with bulk actions
- Export to CSV/Excel
- Column visibility toggle
- Column resizing
- Advanced filter builder
- Saved filter presets
- Keyboard shortcuts

## Support

For issues or questions, please refer to the project documentation or contact the development team.

## License

Part of the Ajar real estate platform.

