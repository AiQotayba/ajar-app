import { getTranslations } from 'next-intl/server';

export default async function NotificationsPage() {
  const t = await getTranslations('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t('notifications')}
              </h1>
              <p className="text-gray-600">
                Stay updated with your account activity
              </p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Mark All as Read
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button className="py-2 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm">
                All (15)
              </button>
              <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm">
                Unread (3)
              </button>
              <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm">
                System (8)
              </button>
              <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm">
                Activity (7)
              </button>
            </nav>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="divide-y divide-gray-200">
            {/* Unread Notification */}
            <div className="p-6 hover:bg-gray-50">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600">✓</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">
                      Your listing has been approved
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      <span className="text-xs text-gray-500">2 hours ago</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Your property "Beautiful Villa in Amman" is now live and visible to all users.
                  </p>
                  <div className="mt-2">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View Listing
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Read Notification */}
            <div className="p-6 hover:bg-gray-50">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600">👁️</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">
                      Your property received 5 new views
                    </h3>
                    <span className="text-xs text-gray-500">4 hours ago</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Your listing "Modern Apartment in Irbid" has been viewed 5 times in the last hour.
                  </p>
                  <div className="mt-2">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View Analytics
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* System Notification */}
            <div className="p-6 hover:bg-gray-50">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600">⚠️</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">
                      System maintenance scheduled
                    </h3>
                    <span className="text-xs text-gray-500">1 day ago</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    We will be performing scheduled maintenance on Sunday, 10:00 PM - 11:00 PM.
                  </p>
                </div>
              </div>
            </div>

            {/* Activity Notification */}
            <div className="p-6 hover:bg-gray-50">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600">❤️</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">
                      Someone added your property to favorites
                    </h3>
                    <span className="text-xs text-gray-500">2 days ago</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Your listing "Luxury Villa in Zarqa" was added to someone's favorites.
                  </p>
                  <div className="mt-2">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View Property
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Older Notifications */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-6 hover:bg-gray-50">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-gray-600">📢</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">
                        Notification {i + 1}
                      </h3>
                      <span className="text-xs text-gray-500">{i + 3} days ago</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      This is a sample notification message for demonstration purposes.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
            Load More Notifications
          </button>
        </div>
      </div>
    </div>
  );
}
