/**
 * Advanced Filters Hook
 * Hook لإدارة الفلاتر المتقدمة مع دعم التصنيفات والخصائص والميزات
 */
import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface Category {
  id: number
  name: {
    ar: string
    en: string
  }
  parent_id?: number
  children?: Category[]
  properties?: Property[]
  features?: Feature[]
}

interface Property {
  id: number
  category_id?: number
  name: {
    ar: string
    en: string
  }
  description?: {
    ar: string | null
    en: string | null
  }
  icon?: string | null
  type: 'text' | 'number' | 'select' | 'string' | 'int' | 'float' | 'bool'
  is_filter?: boolean
  options?: Array<{
    ar: string
    en: string
  }> | null
  sort_order?: number
  is_visible?: boolean
}

interface Feature {
  id: number
  name: {
    ar: string
    en: string
  }
  description?: {
    ar: string | null
    en: string | null
  }
  icon?: string | null
  sort_order?: number
  is_visible?: boolean
}

interface AdvancedFilterState {
  // Basic filters
  propertyType: string
  propertyCategory: string
  governorate: string
  city: string
  priceFrom: string
  priceTo: string
  areaFrom: string
  areaTo: string
  rooms: string
  furnished: string
  searchQuery: string
  
  // Advanced filters
  selectedCategory: Category | null
  selectedSubCategory: Category | null
  selectedSubSubCategory: Category | null
  availableProperties: Property[]
  availableFeatures: Feature[]
  selectedProperties: Record<number, string>
  selectedFeatures: number[]
}

export function useAdvancedFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [filters, setFilters] = useState<AdvancedFilterState>(() => {
    const selectedProperties: Record<number, string> = {}
    searchParams.forEach((value, key) => {
      if (key.startsWith('property_')) {
        const propertyId = parseInt(key.replace('property_', ''))
        if (!isNaN(propertyId)) {
          selectedProperties[propertyId] = value
        }
      }
    })

    const featuresParam = searchParams.get('features')
    const selectedFeatures = featuresParam ? featuresParam.split(',').map(id => parseInt(id)).filter(id => !isNaN(id)) : []

    return {
      propertyType: searchParams.get('property_type') || 'بيع',
      propertyCategory: searchParams.get('category') || '',
      governorate: searchParams.get('governorate') || '',
      city: searchParams.get('city') || '',
      priceFrom: searchParams.get('price_from') || '',
      priceTo: searchParams.get('price_to') || '',
      areaFrom: searchParams.get('area_from') || '',
      areaTo: searchParams.get('area_to') || '',
      rooms: searchParams.get('rooms') || '',
      furnished: searchParams.get('furnished') || 'furnished',
      searchQuery: searchParams.get('search') || '',
      selectedCategory: null,
      selectedSubCategory: null,
      selectedSubSubCategory: null,
      availableProperties: [],
      availableFeatures: [],
      selectedProperties,
      selectedFeatures
    }
  })

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/user/categories')
      return response.data || []
    }
  })

  // Fetch governorates
  const { data: governorates = [] } = useQuery({
    queryKey: ['governorates'],
    queryFn: async () => {
      const response = await api.get('/user/governorates')
      return response.data || []
    }
  })

  // Fetch cities
  const { data: cities = [] } = useQuery({
    queryKey: ['cities', filters.governorate],
    queryFn: async () => {
      const response = await api.get('/user/cities')
      return response.data || []
    },
    enabled: !!filters.governorate
  })

  const organizeCategories = useCallback((categories: Category[]) => {
    const mainCategories = categories.filter(cat => !cat.parent_id)
    const subCategories = categories.filter(cat => cat.parent_id)
    
    return mainCategories.map(main => ({
      ...main,
      children: subCategories.filter(sub => sub.parent_id === main.id)
    }))
  }, [])

  const organizedCategories = organizeCategories(categories)
  const selectedMainCategoryData = organizedCategories.find(cat => cat.id.toString() === filters.propertyCategory)
  const availableSubCategories = selectedMainCategoryData?.children || []

  const filteredCities = cities.filter((city: any) => 
    !filters.governorate || city.governorate_id.toString() === filters.governorate
  )

  // Sync filters with URL params when data changes
  useEffect(() => {
    if (categories.length > 0) {
      // Find and set selected category
      const categoryId = filters.propertyCategory
      if (categoryId) {
        const category = categories.find(cat => cat.id.toString() === categoryId)
        if (category) {
          setFilters(prev => ({
            ...prev,
            selectedCategory: category,
            availableProperties: category.properties || [],
            availableFeatures: category.features || []
          }))

          // Check if it's a subcategory
          if (category.parent_id) {
            const parentCategory = categories.find(cat => cat.id === category.parent_id)
            if (parentCategory) {
              setFilters(prev => ({
                ...prev,
                selectedSubCategory: category,
                selectedCategory: parentCategory
              }))
            }
          }
        }
      }
    }
  }, [categories, filters.propertyCategory])

  // Restore filters from URL on page load/refresh
  const restoreFiltersFromURL = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search)
    
    // Update filters from URL params
    const newFilters: Partial<AdvancedFilterState> = {}
    
    if (urlParams.get('property_type')) newFilters.propertyType = urlParams.get('property_type')!
    if (urlParams.get('category')) newFilters.propertyCategory = urlParams.get('category')!
    if (urlParams.get('governorate')) newFilters.governorate = urlParams.get('governorate')!
    if (urlParams.get('city')) newFilters.city = urlParams.get('city')!
    if (urlParams.get('price_from')) newFilters.priceFrom = urlParams.get('price_from')!
    if (urlParams.get('price_to')) newFilters.priceTo = urlParams.get('price_to')!
    if (urlParams.get('area_from')) newFilters.areaFrom = urlParams.get('area_from')!
    if (urlParams.get('area_to')) newFilters.areaTo = urlParams.get('area_to')!
    if (urlParams.get('rooms')) newFilters.rooms = urlParams.get('rooms')!
    if (urlParams.get('furnished')) newFilters.furnished = urlParams.get('furnished')!
    if (urlParams.get('search')) newFilters.searchQuery = urlParams.get('search')!

    // Parse properties and features
    const selectedProperties: Record<number, string> = {}
    const selectedFeatures: number[] = []
    
    urlParams.forEach((value, key) => {
      if (key.startsWith('property_')) {
        const propertyId = parseInt(key.replace('property_', ''))
        if (!isNaN(propertyId)) {
          selectedProperties[propertyId] = value
        }
      }
    })

    const featuresParam = urlParams.get('features')
    if (featuresParam) {
      featuresParam.split(',').forEach(id => {
        const featureId = parseInt(id)
        if (!isNaN(featureId)) {
          selectedFeatures.push(featureId)
        }
      })
    }

    if (Object.keys(newFilters).length > 0 || Object.keys(selectedProperties).length > 0 || selectedFeatures.length > 0) {
      setFilters(prev => ({
        ...prev,
        ...newFilters,
        selectedProperties,
        selectedFeatures
      }))
    }
  }, [])

  // Restore filters from URL on mount
  useEffect(() => {
    restoreFiltersFromURL()
  }, [restoreFiltersFromURL])

  // Listen for URL changes (back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      restoreFiltersFromURL()
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [restoreFiltersFromURL])

  // Handle category selection
  const handleCategoryChange = useCallback(async (categoryId: string) => {
    const category = categories.find(cat => cat.id.toString() === categoryId)
    
    if (category) {
      setFilters(prev => ({
        ...prev,
        propertyCategory: categoryId,
        selectedCategory: category,
        selectedSubCategory: null,
        selectedSubSubCategory: null,
        availableProperties: category.properties || [],
        availableFeatures: category.features || [],
        selectedProperties: {},
        selectedFeatures: []
      }))

      // Load subcategories if they exist
      if (category.children && category.children.length > 0) {
        // Subcategories are already in the category data
      } else {
        // Load subcategories from API
        try {
          const response = await api.get(`/user/categories?parent_id=${categoryId}`)
          if (!response.isError && response.data) {
            // Subcategories loaded from API
          }
        } catch (error) {
          console.error('Error loading subcategories:', error)
        }
      }
    }
  }, [categories])

  // Handle subcategory selection
  const handleSubCategoryChange = useCallback(async (subCategoryId: string) => {
    const subCategory = availableSubCategories.find(cat => cat.id.toString() === subCategoryId)
    
    if (subCategory) {
      setFilters(prev => ({
        ...prev,
        selectedSubCategory: subCategory,
        selectedSubSubCategory: null,
        availableProperties: subCategory.properties || [],
        availableFeatures: subCategory.features || [],
        selectedProperties: {},
        selectedFeatures: []
      }))

      // Load sub-subcategories if they exist
      if (subCategory.children && subCategory.children.length > 0) {
        // Sub-subcategories found in subcategory data
      } else {
        // Load sub-subcategories from API
        try {
          const response = await api.get(`/user/categories?parent_id=${subCategoryId}`)
          if (!response.isError && response.data) {
            // Sub-subcategories loaded from API
          }
        } catch (error) {
          console.error('Error loading sub-subcategories:', error)
        }
      }
    }
  }, [availableSubCategories])

  // Handle sub-subcategory selection
  const handleSubSubCategoryChange = useCallback(async (subSubCategoryId: string) => {
    const subSubCategory = availableSubCategories.find(cat => cat.id.toString() === subSubCategoryId)
    
    if (subSubCategory) {
      setFilters(prev => ({
        ...prev,
        selectedSubSubCategory: subSubCategory,
        availableProperties: subSubCategory.properties || [],
        availableFeatures: subSubCategory.features || [],
        selectedProperties: {},
        selectedFeatures: []
      }))
    }
  }, [availableSubCategories])

  // Handle property selection
  const handlePropertyChange = useCallback((propertyId: number, value: string) => {
    setFilters(prev => ({
      ...prev,
      selectedProperties: {
        ...prev.selectedProperties,
        [propertyId]: value
      }
    }))
  }, [])

  // Handle feature selection
  const handleFeatureToggle = useCallback((featureId: number) => {
    setFilters(prev => ({
      ...prev,
      selectedFeatures: prev.selectedFeatures.includes(featureId)
        ? prev.selectedFeatures.filter(id => id !== featureId)
        : [...prev.selectedFeatures, featureId]
    }))
  }, [])

  // Handle basic filter changes
  const handleFilterChange = useCallback((key: keyof AdvancedFilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  // Update URL parameters
  const updateURLParams = useCallback((newFilters: AdvancedFilterState) => {
    const params = new URLSearchParams()
    
    // Basic filters
    if (newFilters.propertyType && newFilters.propertyType !== 'بيع') {
      params.set('property_type', newFilters.propertyType)
    }
    if (newFilters.propertyCategory) {
      params.set('category', newFilters.propertyCategory)
    }
    if (newFilters.governorate) {
      params.set('governorate', newFilters.governorate)
    }
    if (newFilters.city) {
      params.set('city', newFilters.city)
    }
    if (newFilters.priceFrom) {
      params.set('price_from', newFilters.priceFrom)
    }
    if (newFilters.priceTo) {
      params.set('price_to', newFilters.priceTo)
    }
    if (newFilters.areaFrom) {
      params.set('area_from', newFilters.areaFrom)
    }
    if (newFilters.areaTo) {
      params.set('area_to', newFilters.areaTo)
    }
    if (newFilters.rooms) {
      params.set('rooms', newFilters.rooms)
    }
    if (newFilters.furnished && newFilters.furnished !== 'furnished') {
      params.set('furnished', newFilters.furnished)
    }
    if (newFilters.searchQuery) {
      params.set('search', newFilters.searchQuery)
    }
    
    // Add selected properties
    Object.entries(newFilters.selectedProperties).forEach(([propertyId, value]) => {
      if (value) {
        params.set(`property_${propertyId}`, value)
      }
    })
    
    // Add selected features
    if (newFilters.selectedFeatures.length > 0) {
      params.set('features', newFilters.selectedFeatures.join(','))
    }
    
    // Update URL without page reload
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`
    window.history.replaceState({}, '', newUrl)
  }, [])

  // Auto-sync with URL when filters change
  useEffect(() => {
    // Debounce URL updates to avoid too many updates
    const timeoutId = setTimeout(() => {
      updateURLParams(filters)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [filters, updateURLParams])

  // Apply filters
  const handleApply = useCallback(() => {
    updateURLParams(filters)
  }, [filters, updateURLParams])

  // Reset filters
  const handleReset = useCallback(() => {
    const resetFilters: AdvancedFilterState = {
      propertyType: 'بيع',
      propertyCategory: '',
      governorate: '',
      city: '',
      priceFrom: '',
      priceTo: '',
      areaFrom: '',
      areaTo: '',
      rooms: '',
      furnished: 'furnished',
      searchQuery: '',
      selectedCategory: null,
      selectedSubCategory: null,
      selectedSubSubCategory: null,
      availableProperties: [],
      availableFeatures: [],
      selectedProperties: {},
      selectedFeatures: []
    }
    setFilters(resetFilters)
    updateURLParams(resetFilters)
  }, [updateURLParams])

  // Check if there are active filters
  const hasActiveFilters = useCallback(() => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'selectedCategory' || key === 'selectedSubCategory' || key === 'selectedSubSubCategory' || 
          key === 'availableProperties' || key === 'availableFeatures' || key === 'selectedProperties' || key === 'selectedFeatures') {
        return false // Skip complex objects
      }
      return value && value !== 'furnished' && value !== 'بيع'
    }) || Object.keys(filters.selectedProperties).length > 0 || filters.selectedFeatures.length > 0
  }, [filters])

  // Get active filters count
  const getActiveFiltersCount = useCallback(() => {
    let count = 0
    
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'selectedCategory' || key === 'selectedSubCategory' || key === 'selectedSubSubCategory' || 
          key === 'availableProperties' || key === 'availableFeatures' || key === 'selectedProperties' || key === 'selectedFeatures') {
        return // Skip complex objects
      }
      
      if (value && value !== 'furnished' && value !== 'بيع') {
        count++
      }
    })
    
    count += Object.keys(filters.selectedProperties).length
    count += filters.selectedFeatures.length
    
    return count
  }, [filters])

  return {
    filters,
    categories: organizedCategories,
    governorates,
    cities: filteredCities,
    availableSubCategories,
    handleCategoryChange,
    handleSubCategoryChange,
    handleSubSubCategoryChange,
    handlePropertyChange,
    handleFeatureToggle,
    handleFilterChange,
    handleApply,
    handleReset,
    hasActiveFilters: hasActiveFilters(),
    getActiveFiltersCount
  }
}
