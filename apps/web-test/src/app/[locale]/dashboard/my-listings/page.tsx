import { Link } from '@/lib/i18n/routing';
import { getTranslations } from 'next-intl/server';

export default async function MyListingsPage() {
  const t = await getTranslations('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t('myListings')}
              </h1>
              <p className="text-gray-600">
                Manage your property listings
              </p>
            </div>
            <Link 
              href="/listings/create"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add New Listing
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button className="py-2 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm">
                All (12)
              </button>
              <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm">
                Active (8)
              </button>
              <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm">
                Pending (2)
              </button>
              <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm">
                Draft (2)
              </button>
            </nav>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 relative">
                <div className="absolute top-4 left-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Active
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                    <span className="text-gray-600">⋮</span>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Beautiful Villa in Amman
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  4 bedrooms • 3 bathrooms • 250 sq ft
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold text-blue-600">
                    $250,000
                  </span>
                  <span className="text-sm text-gray-500">
                    For Sale
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <span className="mr-1">👁️</span>
                    <span>24 views</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">❤️</span>
                    <span>5 favorites</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Link 
                    href={`/listings/${i + 1}`}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center text-sm"
                  >
                    View
                  </Link>
                  <Link 
                    href={`/listings/${i + 1}/edit`}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors text-center text-sm"
                  >
                    Edit
                  </Link>
                  <button className="flex-1 border border-red-300 text-red-700 py-2 px-4 rounded-md hover:bg-red-50 transition-colors text-sm">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

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
