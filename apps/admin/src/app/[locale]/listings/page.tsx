import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

// Placeholder components
function ListingsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-48 bg-gray-200"></div>
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2">Property {i + 1}</h3>
            <p className="text-gray-600 mb-2">Beautiful property in great location</p>
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-blue-600">$150,000</span>
              <span className="text-sm text-gray-500">For Sale</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SearchFilters() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h3 className="text-lg font-semibold mb-4">Search Filters</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <select className="w-full p-2 border border-gray-300 rounded-md">
            <option>All Locations</option>
            <option>Amman</option>
            <option>Irbid</option>
            <option>Zarqa</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <select className="w-full p-2 border border-gray-300 rounded-md">
            <option>All Types</option>
            <option>For Sale</option>
            <option>For Rent</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
          <select className="w-full p-2 border border-gray-300 rounded-md">
            <option>Any Price</option>
            <option>Under $100,000</option>
            <option>$100,000 - $200,000</option>
            <option>Over $200,000</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select className="w-full p-2 border border-gray-300 rounded-md">
            <option>All Categories</option>
            <option>Apartments</option>
            <option>Villas</option>
            <option>Offices</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default async function ListingsPage() {
  const t = await getTranslations('common');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('listings')}
          </h1>
          <p className="text-gray-600">
            Discover amazing properties in your area
          </p>
        </div>

        <SearchFilters />

        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-600">
            Showing 1-6 of 24 properties
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Grid View
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
              List View
            </button>
          </div>
        </div>

        <Suspense fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        }>
          <ListingsGrid />
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
  );
}
