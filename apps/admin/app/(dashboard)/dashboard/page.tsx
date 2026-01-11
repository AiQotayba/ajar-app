"use client"

import { Building2, Users, Star, MessageSquare, Clock, AlertCircle, LayoutDashboard } from "lucide-react"
import { ListingsChart } from "@/components/dashboard/listings-chart"
import { UsersChart } from "@/components/dashboard/users-chart"
import { ReviewsChart } from "@/components/dashboard/reviews-chart"
import { PageHeader } from "@/components/dashboard/page-header"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api-client"
import { useQuery } from "@tanstack/react-query"
import { formatDistanceToNow, parseISO } from "date-fns"
import { ar } from "date-fns/locale"
import Image from "next/image"

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboardData"],
    queryFn: () => api.get("/admin/dashboard/analytics").then(res => res.data),
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="space-y-6 md:space-y-8 p-4 md:p-6 lg:p-8">
          {/* Header Skeleton */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-3">
              <Skeleton className="h-10 w-64 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse rounded-lg" />
              <Skeleton className="h-5 w-80 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse rounded-lg" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className="h-10 w-64 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse rounded-lg" />
              <Skeleton className="h-10 w-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse rounded-lg" />
              <Skeleton className="h-10 w-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse rounded-lg" />
            </div>
          </div>

          {/* Quick Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-32 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse rounded-full" />
                      <Skeleton className="h-8 w-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse rounded-lg" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse rounded-full" />
                        <Skeleton className="h-3 w-20 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse rounded-full" />
                      </div>
                    </div>
                    <Skeleton className="h-12 w-12 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Chart */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-48 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse rounded-lg" />
                      <Skeleton className="h-4 w-64 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse rounded-lg" />
                    </div>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-8 w-16 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse rounded-lg" />
                      ))}
                    </div>
                  </div>
                  <Skeleton className="h-80 w-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse rounded-lg" />
                </div>
              </div>
            </div>

            {/* Side Charts */}
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-40 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse rounded-lg" />
                        <Skeleton className="h-4 w-32 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse rounded-lg" />
                      </div>
                      <Skeleton className="h-8 w-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse rounded-lg" />
                    </div>
                    <Skeleton className="h-48 w-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Items Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <Skeleton className="h-6 w-32 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse rounded-lg" />
                    <Skeleton className="h-6 w-16 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse rounded-full" />
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 animate-pulse">
                        <Skeleton className="h-12 w-12 rounded-xl bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-48 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded" />
                          <Skeleton className="h-3 w-32 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded" />
                        </div>
                        <Skeleton className="h-6 w-16 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Stats Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl p-4 border border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 animate-pulse">
                <Skeleton className="h-4 w-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded mb-2" />
                <Skeleton className="h-8 w-32 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="space-y-6 md:space-y-8 p-4 md:p-6 lg:p-8">
          <PageHeader
            title="لوحة التحكم"
            description="حدث خطأ في تحميل البيانات"
            icon={AlertCircle}
          />
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">فشل في تحميل البيانات</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
              تعذر تحميل بيانات لوحة التحكم. يرجى التحقق من اتصال الشبكة والمحاولة مرة أخرى.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    )
  }

  // معالجة تنسيق الوقت
  const formatTimeAgo = (dateString: string) => {
    try {
      const date = parseISO(dateString)
      return formatDistanceToNow(date, { addSuffix: true, locale: ar })
    } catch {
      return "غير معروف"
    }
  }

  // الحصول على أحدث الإعلانات (آخر 4)
  const recentListings = data?.listingsPublished?.slice(0, 4) || []

  // الحصول على أحدث المستخدمين (آخر 4)
  const recentUsers = data?.users?.slice(0, 4) || []


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="space-y-6 md:space-y-8 p-4 md:p-6 lg:p-8">

        <PageHeader
          title="لوحة التحكم"
          description="مرحباً بك في لوحة تحكم أجار"
          icon={LayoutDashboard}
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">الإعلانات المنشورة</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{data?.counts?.listingsPublished || 0}</h3>
                </div>
                <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">الإعلانات المسودة</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{data?.counts?.listongsDraft || 0}</h3>
                </div>
                <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                  <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">إجمالي المستخدمين</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{data?.counts?.users || 0}</h3>
                </div>
                <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                  <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">متوسط التقييم</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{data?.counts?.reviewsAverage?.toFixed(1) || "0.0"}/5</h3>
                </div>
                <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                  <Star className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ListingsChart data={data?.graph?.listings} />
          <UsersChart data={data?.graph?.users} />
          <ReviewsChart data={data?.graph?.reviews} />
        </div>

        {/* Recent Items */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Listings */}
          <div className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">آخر الإعلانات</h3>
                <Badge variant="outline" className="text-xs">
                  {data?.counts?.listingsPublished || 0} إعلان
                </Badge>
              </div>
              <div className="space-y-4">
                {recentListings.map((listing: any) => (
                  <div
                    key={listing.id}
                    className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all hover:shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 overflow-hidden">
                      {listing.cover_image && (
                        <Image
                          src={`https://backend.ajarsyria.com/storage/${listing.cover_image}`}
                          alt={listing.title?.ar}
                          className="w-full h-full object-cover"
                          width={48}
                          height={48}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{listing.title?.ar}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(listing.created_at)}
                        </span>
                      </div>
                    </div>
                    <Badge variant={listing.status === "approved" ? "default" : "secondary"} className="text-xs">
                      {listing.status === "approved" ? "منشور" : "معلق"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Users */}
          <div className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">المستخدمون الجدد</h3>
                <Badge variant="outline" className="text-xs">
                  {data?.counts?.users || 0} مستخدم
                </Badge>
              </div>
              <div className="space-y-4">
                {recentUsers.map((user: any) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all hover:shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-primary to-primary/60">
                      {user.avatar_url && (
                        <Image
                          src={user.avatar_url}
                          alt={user.full_name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{user.full_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(user.created_at)}
                        </span>
                      </div>
                    </div>
                    <Badge variant={user.status === "active" ? "default" : "secondary"} className="text-xs">
                      {user.status === "active" ? "نشط" : "غير نشط"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">آخر التقييمات</h3>
                <Badge variant="outline" className="text-xs">
                  {data?.counts?.reviews || 0} تقييم
                </Badge>
              </div>
              <div className="space-y-4">
                {data?.reviews?.slice(0, 4).map((review: any) => (
                  <div
                    key={review.id}
                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{review.rating}/5</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(review.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl p-4 border border-blue-200 dark:border-blue-800/30 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">إجمالي القيمة</div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              ${data?.listingsPublished?.reduce((acc: number, l: any) => acc + (l.price || 0), 0).toLocaleString() || 0}
            </div>
          </div>
          <div className="rounded-xl p-4 border border-green-200 dark:border-green-800/30 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <div className="text-sm text-green-600 dark:text-green-400 mb-1">متوسط السعر</div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              ${(data?.listingsPublished?.reduce((acc: number, l: any) => acc + (l.price || 0), 0) / (data?.listingsPublished?.length || 1)).toFixed(0).toLocaleString() || 0}
            </div>
          </div>
          <div className="rounded-xl p-4 border border-purple-200 dark:border-purple-800/30 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">معدل التحويل</div>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {((data?.reviews?.length || 0) / (data?.listingsPublished?.length || 1) * 100).toFixed(1)}%
            </div>
          </div>
          <div className="rounded-xl p-4 border border-amber-200 dark:border-amber-800/30 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
            <div className="text-sm text-amber-600 dark:text-amber-400 mb-1">رضا العملاء</div>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
              {(data?.counts?.reviewsAverage || 0).toFixed(1)}/5
            </div>
          </div>
        </div> */}
      </div>
    </div>
  )
}

// مكون Skeleton الأساسي
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${className}`} />
  )
}