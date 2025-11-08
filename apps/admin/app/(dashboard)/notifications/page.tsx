"use client"

import * as React from "react"
import { Bell, Check, CheckCheck, Trash2, Clock, AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"

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

interface NotificationsResponse {
    success: boolean
    data: Notification[]
    meta: {
        current_page: number
        last_page: number
        per_page: number
        total: number
    }
}

export default function NotificationsPage() {
    const queryClient = useQueryClient()
    const [filter, setFilter] = React.useState<"all" | "unread" | "read">("all")

    // Fetch notifications
    const { data: notificationsData, isLoading, error } = useQuery({
        queryKey: ["notifications", filter],
        queryFn: async () => {
            const params: Record<string, string | number | boolean> | undefined =
                filter !== "all" ? { is_read: filter === "read" } : undefined
            const response = await api.get("/admin/notifications", { params })

            if (response.isError) {
                throw new Error(response.message || "فشل في تحميل الإشعارات")
            }

            // API returns { success: true, data: [...], meta: {...} }
            const apiResponse = response.data as NotificationsResponse
            return apiResponse?.data || []
        },
        staleTime: 30000, // 30 seconds
        refetchOnWindowFocus: false,
    })

    const notifications = notificationsData || []

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
            toast.success("تم تحديد الإشعار كمقروء")
        },
        onError: (error: any) => {
            const errorMessage = error?.message || error?.response?.data?.message || "فشل تحديث حالة الإشعار"
            toast.error(errorMessage)
        },
    })

    // Mark all as read mutation
    const markAllAsReadMutation = useMutation({
        mutationFn: async () => {
            const response = await api.put("/admin/notifications/read-all")
            if (response.isError) {
                throw new Error(response.message || "فشل تحديث الإشعارات")
            }
            return response
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] })
            toast.success("تم تحديد جميع الإشعارات كمقروءة")
        },
        onError: (error: any) => {
            const errorMessage = error?.message || error?.response?.data?.message || "فشل تحديث الإشعارات"
            toast.error(errorMessage)
        },
    })

    const handleMarkAsRead = (id: number) => {
        markAsReadMutation.mutate(id)
    }

    const handleMarkAllAsRead = () => {
        markAllAsReadMutation.mutate()
    }


    const getTypeConfig = (notification: Notification) => {
        const type = notification.metadata?.type || "info"
        const configs = {
            info: {
                color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
                label: "معلومة",
                icon: Info,
                bgGradient: "from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10",
            },
            success: {
                color: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
                label: "نجاح",
                icon: CheckCircle2,
                bgGradient: "from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10",
            },
            warning: {
                color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
                label: "تحذير",
                icon: AlertTriangle,
                bgGradient: "from-yellow-50 to-yellow-100/50 dark:from-yellow-950/20 dark:to-yellow-900/10",
            },
            error: {
                color: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
                label: "خطأ",
                icon: AlertCircle,
                bgGradient: "from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/10",
            },
            general_announcement: {
                color: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
                label: "إعلان عام",
                icon: Bell,
                bgGradient: "from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10",
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
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const unreadCount = notifications?.filter((n) => !n.is_read).length || 0

    return (
        <div className="space-y-4 md:space-y-6" dir="rtl">
            <PageHeader
                title="الإشعارات"
                description="عرض وإدارة جميع الإشعارات في لوحة التحكم"
                icon={Bell}
                actions={[
                    {
                        label: "تحديد الكل كمقروء",
                        onClick: handleMarkAllAsRead,
                        disabled: unreadCount === 0 || markAllAsReadMutation.isPending,
                        icon: CheckCheck,
                    }
                ]}
            />

            {/* Stats Cards */}
            {notifications && notifications.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-card rounded-xl border p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">إجمالي الإشعارات</p>
                                <p className="text-2xl font-bold">{notifications.length}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Bell className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-card rounded-xl border p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">غير مقروء</p>
                                <p className="text-2xl font-bold text-primary">{unreadCount}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Check className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-card rounded-xl border p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">مقروء</p>
                                <p className="text-2xl font-bold text-muted-foreground">
                                    {notifications.filter((n) => n.is_read).length}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                <CheckCheck className="h-6 w-6 text-muted-foreground" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="w-full" dir="rtl">
                <TabsList className="grid grid-cols-3 *:px-6 bg-muted/50 border-1">
                    <TabsTrigger
                        value="all"
                        className="flex items-center justify-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                    >
                        <span>الكل</span>
                        {notifications && notifications.length > 0 && (
                            <Badge variant="secondary" className="text-xs font-medium">
                                {notifications.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger
                        value="unread"
                        className="flex items-center justify-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                    >
                        <span>غير مقروء</span>
                        {unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs font-medium animate-pulse">
                                {unreadCount}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger
                        value="read"
                        className="flex items-center justify-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                    >
                        <span>مقروء</span>
                        {notifications && notifications.filter((n) => n.is_read).length > 0 && (
                            <Badge variant="secondary" className="text-xs font-medium">
                                {notifications.filter((n) => n.is_read).length}
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={filter} className="mt-6">
                    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                        {isLoading ? (
                            <div className="p-6 space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="space-y-3">
                                        <div className="flex items-start gap-4">
                                            <Skeleton className="h-12 w-12 rounded-full" />
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Skeleton className="h-5 w-20" />
                                                    <Skeleton className="h-4 w-4 rounded-full" />
                                                    <Skeleton className="h-4 w-24" />
                                                </div>
                                                <Skeleton className="h-5 w-3/4" />
                                                <Skeleton className="h-4 w-full" />
                                            </div>
                                        </div>
                                        {i < 4 && <div className="border-t mt-4" />}
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="p-16 text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-6">
                                    <AlertCircle className="w-10 h-10 text-destructive" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">حدث خطأ في تحميل الإشعارات</h3>
                                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                                    {(error as Error)?.message || "يرجى المحاولة مرة أخرى لاحقاً"}
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => queryClient.invalidateQueries({ queryKey: ["notifications"] })}
                                >
                                    إعادة المحاولة
                                </Button>
                            </div>
                        ) : !notifications || notifications.length === 0 ? (
                            <div className="p-16 text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                                    <Bell className="w-10 h-10 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">لا توجد إشعارات</h3>
                                <p className="text-sm text-muted-foreground">
                                    {filter === "unread"
                                        ? "جميع الإشعارات مقروءة"
                                        : filter === "read"
                                            ? "لا توجد إشعارات مقروءة"
                                            : "لم يتم العثور على أي إشعارات حتى الآن"}
                                </p>
                            </div>
                        ) : (
                            <ScrollArea className="h-[calc(100vh-400px)]" dir="rtl">
                                <div className="divide-y divide-border">
                                    {notifications.map((notification, index) => {
                                        const typeConfig = getTypeConfig(notification)
                                        const TypeIcon = typeConfig.icon
                                        const link = notification.metadata?.link

                                        return (
                                            <div
                                                key={notification.id}
                                                className={cn(
                                                    "group relative p-5 transition-all duration-200",
                                                    "hover:bg-muted/30",
                                                    !notification.is_read && cn(
                                                        "bg-gradient-to-l",
                                                        typeConfig.bgGradient,
                                                        "border-r-4 border-r-primary"
                                                    ),
                                                    notification.is_read && "opacity-75"
                                                )}
                                                style={{
                                                    animationDelay: `${index * 50}ms`,
                                                }}
                                            >
                                                <div className="flex items-start gap-4">
                                                    {/* Icon */}
                                                    <div className={cn(
                                                        "flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center",
                                                        "bg-gradient-to-br",
                                                        typeConfig.bgGradient,
                                                        "border",
                                                        typeConfig.color.split(" ")[2]
                                                    )}>
                                                        <TypeIcon className={cn(
                                                            "h-6 w-6",
                                                            typeConfig.color.split(" ")[1]
                                                        )} />
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                            <Badge
                                                                variant="outline"
                                                                className={cn(
                                                                    "text-xs font-medium border",
                                                                    typeConfig.color
                                                                )}
                                                            >
                                                                {typeConfig.label}
                                                            </Badge>
                                                            {!notification.is_read && (
                                                                <span
                                                                    className="h-2 w-2 rounded-full bg-primary animate-pulse"
                                                                    aria-label="غير مقروء"
                                                                />
                                                            )}
                                                            <div className="flex items-center gap-1 text-xs text-muted-foreground mr-auto">
                                                                <Clock className="h-3 w-3" />
                                                                <span>{formatDate(notification.created_at)}</span>
                                                            </div>
                                                        </div>

                                                        <h4
                                                            className={cn(
                                                                "text-base font-semibold mb-2 text-foreground",
                                                                !notification.is_read && "font-bold"
                                                            )}
                                                        >
                                                            {notification.title}
                                                        </h4>

                                                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                                                            {notification.message}
                                                        </p>

                                                        {link && (
                                                            <a
                                                                href={link}
                                                                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 hover:underline transition-colors"
                                                            >
                                                                <span>عرض التفاصيل</span>
                                                                <span className="text-lg leading-none">←</span>
                                                            </a>
                                                        )}
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {!notification.is_read && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleMarkAsRead(notification.id)}
                                                                disabled={markAsReadMutation.isPending}
                                                                className="h-9 w-9 hover:bg-primary/10 hover:text-primary"
                                                                title="تحديد كمقروء"
                                                                aria-label="تحديد كمقروء"
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </ScrollArea>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

