"use client"

import { PropertyFormEngine } from "./property-form-engine"
import type { PropertyFormData } from "./property-form-engine"

// Example usage for creating a new property
export function CreatePropertyExample() {
  const handleSuccess = (data: any) => {
    console.log("Property created successfully:", data)
    // Redirect to property details or listings page
  }

  const handleCancel = () => {
    // Handle cancel action
    window.history.back()
  }

  return (
    <PropertyFormEngine
      isEditing={false}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  )
}

// Example usage for editing an existing property
export function EditPropertyExample({ listingId }: { listingId: string }) {
  const handleSuccess = (data: any) => {
    console.log("Property updated successfully:", data)
    // Redirect to property details or listings page
  }

  const handleCancel = () => {
    // Handle cancel action
    window.history.back()
  }

  return (
    <PropertyFormEngine
      isEditing={true}
      listingId={listingId}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  )
}

// Example with initial data for editing
export function EditPropertyWithDataExample({ 
  listingId, 
  initialData 
}: { 
  listingId: string
  initialData: Partial<PropertyFormData>
}) {
  const handleSuccess = (data: any) => {
    console.log("Property updated successfully:", data)
  }

  return (
    <PropertyFormEngine
      isEditing={true}
      listingId={listingId}
      initialData={initialData}
      onSuccess={handleSuccess}
    />
  )
}

