# Map Components

## Overview
This directory contains components for the map functionality, including Google Maps integration, property clustering, and location permissions.

## Components

### MapView
Main map component that displays properties on Google Maps with clustering functionality.

**Features:**
- Google Maps integration
- Property clustering with count display
- Zoom controls (+ and - buttons)
- Property type filters (All, Rent, Sell)
- Real-time data loading based on map bounds
- Click handlers for clusters and individual properties

**Props:**
- `hasPermission: boolean` - Whether location permission is granted

**API Integration:**
- Uses the backend API endpoint: `/api/v1/user/listings?map_mode=1`
- Supports parameters: north, south, east, west, zoom, max_items, radius_px, merge_factor
- Handles both cluster and individual property data

### LocationPermissionModal
Modal component for requesting location permission from users.

**Features:**
- Clean, user-friendly design
- Security and privacy information
- Allow/Deny buttons
- Responsive layout

**Props:**
- `open: boolean` - Whether the modal is visible
- `onAllow: () => void` - Callback when user allows location
- `onDeny: () => void` - Callback when user denies location

## Usage

```tsx
import { MapView, LocationPermissionModal } from '@/components/map'

function MapPage() {
  const [hasPermission, setHasPermission] = useState(false)
  const [showModal, setShowModal] = useState(true)

  return (
    <div>
      <MapView hasPermission={hasPermission} />
      <LocationPermissionModal 
        open={showModal}
        onAllow={() => {
          setHasPermission(true)
          setShowModal(false)
        }}
        onDeny={() => setShowModal(false)}
      />
    </div>
  )
}
```

## API Data Structure

### Cluster Data
```typescript
interface Cluster {
  type: 'cluster'
  cluster_id: string
  count: number
  lat: number
  lng: number
  expansionZoom: number
  bbox: {
    north: number
    south: number
    east: number
    west: number
  }
  clusterRadiusMeters: number
  nudgeZoomIfStillCluster: number
}
```

### Property Data
```typescript
interface Property {
  type: 'ad'
  id: number
  lat: number
  lng: number
}
```

## Environment Variables

Required environment variables:
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps API key
- `NEXT_PUBLIC_API_URL` - Backend API URL

## Styling

The map uses custom styling to match the application's design:
- Light gray background for land areas
- Blue water areas
- Hidden POI labels for cleaner appearance
- Custom marker styles for clusters and properties
- Responsive design for mobile and desktop

## Internationalization

All text content is internationalized using next-intl:
- Map titles and labels
- Permission modal text
- Filter button labels
- Loading states
