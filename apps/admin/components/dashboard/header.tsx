"use client"

import * as React from "react"
import { Bell, Download, Calendar, ChevronDown, LayoutDashboard, Check, Clock, AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface HeaderProps {
  onMenuToggle?: () => void
}

interface Notification {
  id: number
  title: string
  message: string
  notificationable_id: number | null
  notificationable_type: string | null
  read_at: string | null
  is_read: boolean
  metadata: {
    type?: "info" | "success" | "warning" | "error" | "general_announcement"
    link?: string
    [key: string]: any
  }
  user: any | null
  created_at: string
  updated_at: string
}

export function Header({ onMenuToggle }: HeaderProps) {
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = React.useState(false)

  // Fetch notifications
  const { data: notificationsData } = useQuery({
    queryKey: ["notifications", "header"],
    queryFn: async () => {
      const response = await api.get("/admin/notifications", {
        params: { per_page: 5 } // جلب آخر 5 إشعارات فقط
      })

      if (response.isError) {
        return []
      }

      const apiResponse = response.data as { success: boolean; data: Notification[] }
      return apiResponse?.data || []
    },
    staleTime: 30000,
    refetchInterval: 60000, // تحديث كل دقيقة
  })

  const notifications = notificationsData || []
  const unreadCount = notifications.filter((n) => !n.is_read).length

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.put(`/admin/notifications/${id}/read`)
      if (response.isError) {
        throw new Error(response.message || "فشل تحديث حالة الإشعار")
      }
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id)
  }

  const getTypeConfig = (notification: Notification) => {
    const type = notification.metadata?.type || "info"
    const configs = {
      info: {
        color: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
        icon: Info,
      },
      success: {
        color: "bg-green-500/10 text-green-700 dark:text-green-400",
        icon: CheckCircle2,
      },
      warning: {
        color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
        icon: AlertTriangle,
      },
      error: {
        color: "bg-red-500/10 text-red-700 dark:text-red-400",
        icon: AlertCircle,
      },
      general_announcement: {
        color: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
        icon: Bell,
      },
    }
    return configs[type as keyof typeof configs] || configs.info
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "الآن"
    if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`
    if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`
    if (diffInSeconds < 604800) return `منذ ${Math.floor(diffInSeconds / 86400)} يوم`

    return date.toLocaleDateString("ar-SA", {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center justify-between",
        "bg-card rounded-3xl m-4 mb-0",
        "px-4 md:px-6 shadow-lg",
        "transition-all duration-200"
      )}
      dir="rtl"
    >
      {/* Left - Page Title */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <LayoutDashboard className="h-5 w-5" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">لوحة التحكم</h1>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9"
              aria-label="الإشعارات"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 h-5 w-5 flex items-center justify-center rounded-full bg-destructive text-white text-xs font-bold ring-2 ring-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 bg-white" align="end" dir="rtl">
            <div className="flex items-center justify-between p-4 border-b bg-white">
              <h3 className="font-semibold text-foreground">الإشعارات</h3>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount} غير مقروء
                </Badge>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">لا توجد إشعارات</p>
              </div>
            ) : (
              <>
                <ScrollArea className="h-[400px]">
                  <div className="divide-y">
                    {notifications.map((notification) => {
                      const typeConfig = getTypeConfig(notification)
                      const TypeIcon = typeConfig.icon

                      return (
                        <div
                          key={notification.id}
                          className={cn(
                            "p-4 transition-colors hover:bg-muted/50",
                            !notification.is_read && "bg-primary/5"
                          )}
                          onClick={() => {
                            if (!notification.is_read) {
                              handleMarkAsRead(notification.id)
                            }
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center",
                              typeConfig.color
                            )}>
                              <TypeIcon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className={cn(
                                  "text-sm font-medium text-foreground",
                                  !notification.is_read && "font-semibold"
                                )}>
                                  {notification.title}
                                </h4>
                                {!notification.is_read && (
                                  <span className="h-2 w-2 rounded-full bg-primary" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{formatDate(notification.created_at)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
                <div className="p-3 border-t">
                  <Link href="/notifications" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full" size="sm">
                      عرض الكل
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </header>
  )
}
