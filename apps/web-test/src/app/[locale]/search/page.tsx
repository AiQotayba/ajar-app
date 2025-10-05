import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

// Search Results Component
function SearchResults() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-48 bg-gray-200 relative">
            <div className="absolute top-4 left-4">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                For Sale
              </span>
            </div>
            <div className="absolute top-4 right-4">
              <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                <span className="text-gray-600">❤️</span>
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Beautiful Property {i + 1}
            </h3>
            <p className="text-gray-600 text-sm mb-2">
              Amman, Jordan
            </p>
            <p className="text-gray-600 text-sm mb-4">
              4 bedrooms • 3 bathrooms • 250 sq ft
            </p>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-xl font-bold text-blue-600">
                $250,000
              </span>
              <div className="flex items-center">
                <span className="text-yellow-500">⭐</span>
                <span className="ml-1 text-sm text-gray-600">4.8</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <span className="mr-1">👁️</span>
                <span>24 views</span>
              </div>
              <div className="flex items-center">
                <span className="mr-1">📅</span>
                <span>2 days ago</span>
              </div>
            </div>

            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
              View Details
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function SearchPage() {
  const t = await getTranslations('search');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('results')}
          </h1>
          <p className="text-gray-600">
            Found 24 properties matching your search criteria
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Search Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('filters')}
              </h3>
              
              <div className="space-y-6">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('priceRange')}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Min Price"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Max Price"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('propertyType')}
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-700">For Sale</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-700">For Rent</span>
                    </label>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('location')}
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>All Locations</option>
                    <option>Amman</option>
                    <option>Irbid</option>
                    <option>Zarqa</option>
                    <option>Aqaba</option>
                  </select>
                </div>

                {/* Features */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('features')}
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-700">Swimming Pool</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-700">Garden</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-700">Parking</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-700">Security</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                    {t('applyFilters')}
                  </button>
                  <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors">
                    {t('clearFilters')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Search Results */}
          <div className="lg:col-span-3">
            {/* Sort Options */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-gray-600">
                Showing 1-9 of 24 properties
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest First</option>
                  <option>Most Popular</option>
                </select>
                <div className="flex border border-gray-300 rounded-md">
                  <button className="px-3 py-2 bg-blue-600 text-white rounded-l-md">
                    Grid
                  </button>
                  <button className="px-3 py-2 border-l border-gray-300 text-gray-700 rounded-r-md hover:bg-gray-50">
                    List
                  </button>
                </div>
              </div>
            </div>

            <Suspense fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            }>
              <SearchResults />
            </Suspense>

            {/* Pagination */}
            <div className="flex justify-center mt-8">
              <nav className="flex gap-2">
                <button className="px-3 py-2 border border-gray-300 text-gray-500 rounded-md hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-3 py-2 bg-blue-600 text-white rounded-md">1</button>
                <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">2</button>
                <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">3</button>
                <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
