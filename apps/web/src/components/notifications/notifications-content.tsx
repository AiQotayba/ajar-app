"use client"

import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Bell, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Notification {
  id: string
  title: {
    ar: string
    en: string
  }
  message: {
    ar: string
    en: string
  }
  created_at: string
  read_at?: string
  is_read: boolean
  type?: string
  metadata?: Record<string, any>
}

export function NotificationsContent() {
  const queryClient = useQueryClient()

  // Fetch notifications using React Query
  const {
    data: notificationsData,
    isLoading,
    error,
    refetch,
    isError
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await api.get('/user/notifications')

      if (response.isError) {
        throw new Error(response.message || 'Failed to fetch notifications')
      }

      return response.data || []
    },
    retry: 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await api.post(`/user/notifications/${notificationId}/read`)

      if (response.isError) {
        throw new Error(response.message || 'Failed to mark notification as read')
      }

      return response.data
    },
    onSuccess: () => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('تم تعليم الإشعار كمقروء')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'حدث خطأ في تحديث الإشعار')
    }
  })

  const notifications = notificationsData || []

  // Helper function to format date
  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const notificationDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    if (notificationDate.getTime() === today.getTime()) {
      return "اليوم"
    } else if (notificationDate.getTime() === yesterday.getTime()) {
      return "أمس"
    } else {
      return date.toLocaleDateString('ar-SA', {
        day: 'numeric',
        month: 'long'
      })
    }
  }

  // Helper function to format time
  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  // Helper function to get localized text
  const getLocalizedText = (text: { ar: string; en: string }, locale: string = 'ar') => {
    return text[locale as keyof typeof text] || text.ar
  }

  const groupedNotifications = notifications.reduce(
    (acc: Record<string, Notification[]>, notification: Notification) => {
      const dateLabel = formatNotificationDate(notification.created_at)
      if (!acc[dateLabel]) {
        acc[dateLabel] = []
      }
      acc[dateLabel].push(notification)
      return acc
    },
    {} as Record<string, Notification[]>,
  )

  // Handle mark as read
  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId)
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">  
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  // Show error state
  if (isError) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-muted-foreground mb-4">
            {error?.message || 'حدث خطأ في تحميل الإشعارات'}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-24">
        {/* Empty State */}
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
          <div className="relative w-80 h-80 mb-8">
            <div className="absolute inset-0 bg-muted/30 rounded-[4rem]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <Bell className="h-32 w-32 text-primary" strokeWidth={1.5} />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">!</span>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-20 left-12 text-muted-foreground/30 text-2xl">▲</div>
            <div className="absolute top-32 right-16 text-muted-foreground/30 text-xl">▶</div>
            <div className="absolute bottom-24 left-20 text-muted-foreground/30 text-lg">◀</div>
            <div className="absolute bottom-32 right-12 text-muted-foreground/30">▼</div>
            <div className="absolute top-40 left-24 text-muted-foreground/30 text-sm">◆</div>
            <div className="absolute bottom-40 right-20 text-muted-foreground/30 text-xs">●</div>
          </div>
          <h2 className="text-2xl font-bold text-center">لا يوجد إشعارات!</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b">
        <Link href="/">
          <Button variant="outline" size="icon" className="rounded-2xl bg-transparent">
            <ChevronLeft className={cn("h-5 w-5", "rotate-180")} />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold">الإشعارات</h1>
        <div className="w-10" />
      </header>

      <div className="p-6 space-y-6">
        {Object.entries(groupedNotifications).map(([dateLabel, items]: any) => (
          <div key={dateLabel} className="space-y-3" dir="rtl">
            <h2 className="text-right font-semibold text-lg">{dateLabel}</h2>
            {items.map((notification: Notification) => (
              <div
                key={notification.id}
                className={`relative p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-md ${notification.is_read ? "bg-card" : "bg-card border-primary/30"
                  }`}
                onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-bold text-lg">
                    {getLocalizedText(notification.title)}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    {formatNotificationTime(notification.created_at)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  {getLocalizedText(notification.message)}
                </p>
                <div className="flex items-center justify-between">
                  {!notification.is_read && (
                    <button
                      className="text-primary font-medium text-sm hover:text-primary/80 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMarkAsRead(notification.id)
                      }}
                      disabled={markAsReadMutation.isPending}
                    >
                      {markAsReadMutation.isPending ? 'جاري التحديث...' : 'تعليم كمقروء'}
                    </button>
                  )}
                  <div className="flex gap-1">
                    <div className={`w-2 h-2 rounded-full ${notification.is_read ? "bg-muted" : "bg-primary"}`} />
                    <div className={`w-2 h-2 rounded-full ${notification.is_read ? "bg-muted" : "bg-primary"}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
