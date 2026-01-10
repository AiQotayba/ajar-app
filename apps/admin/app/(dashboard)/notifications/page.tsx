"use client"

import * as React from "react"
import { Bell, CheckCheck, Clock, AlertCircle, CheckCircle2, Info, AlertTriangle, ExternalLink, Building2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

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
        data?: {
            user_name?: string
            listing_id?: number
            [key: string]: any
        }
        replace?: {
            user_name?: string
            listing_id?: number
            [key: string]: any
        }
        notificationable?: {
            id: number
            type: string
        }
        [key: string]: any
    }
    user: {
        id: number
        first_name: string
        last_name: string
        full_name: string
        phone: string
        email: string
        role: string
        status: string
        phone_verified: boolean
        avatar: string | null
        avatar_url: string
        language: string
        wallet_balance: number
        sort_order: number | null
        notifications_unread_count: number
        listings_count: number
        created_at: string
        updated_at: string
    } | null
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

// Form validation schema
const createNotificationSchema = z.object({
    title_ar: z.string().min(1, "العنوان بالعربية مطلوب"),
    title_en: z.string().min(1, "العنوان بالإنجليزية مطلوب"),
    message_ar: z.string().min(1, "الرسالة بالعربية مطلوبة"),
    message_en: z.string().min(1, "الرسالة بالإنجليزية مطلوبة"),
    type: z.enum(["info", "success", "warning", "error", "general_announcement"]).default("general_announcement"),
})

type CreateNotificationFormValues = z.infer<typeof createNotificationSchema>

export default function NotificationsPage() {
    const queryClient = useQueryClient()
    const [filter, setFilter] = React.useState<"all" | "unread" | "read">("all")
    const [selectedNotification, setSelectedNotification] = React.useState<Notification | null>(null)
    const [createDialogOpen, setCreateDialogOpen] = React.useState(false)

    // Fetch notifications
    const { data: notifications, isLoading, error } = useQuery({
        queryKey: ["notifications", filter],
        queryFn: async () => {
            const params: Record<string, string | number | boolean> | undefined =
                filter !== "all" ? { is_read: filter === "read" } : undefined
            const response = await api.get("/admin/notifications", { params })

            if (response.isError) {
                throw new Error(response.message || "فشل في تحميل الإشعارات")
            }

            // API returns { success: true, data: [...], meta: {...} }
            return response.data?.data || response.data || []
        },
        staleTime: 30000, // 30 seconds
        refetchOnWindowFocus: false,
    })


    // Mark last notification as read mutation
    const markLastAsReadMutation = useMutation({
        mutationFn: async (id: number) => {
            // Using POST as specified in the API documentation
            const response = await api.post(`/user/notifications/${id}/read`)
            if (response.isError) {
                throw new Error(response.message || "فشل تحديث حالة الإشعار")
            }
            return response
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] })
            toast.success("تم تحديد كل الإشعارات كمقروء")
        },
        onError: (error: any) => {
            const errorMessage = error?.message || error?.response?.data?.message || "فشل تحديث حالة الإشعار"
            toast.error(errorMessage)
        },
    })

    // Create notification mutation
    const createNotificationMutation = useMutation({
        mutationFn: async (data: CreateNotificationFormValues) => {
            const payload = {
                user_id: null,
                title: {
                    ar: data.title_ar,
                    en: data.title_en,
                },
                message: {
                    ar: data.message_ar,
                    en: data.message_en,
                },
                metadata: {
                    type: data.type,
                },
            }
            const response = await api.post("/admin/notifications", payload)
            if (response.isError) {
                throw new Error(response.message || "فشل إنشاء الإشعار")
            }
            return response
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] })
            toast.success("تم إنشاء الإشعار بنجاح")
            setCreateDialogOpen(false)
        },
        onError: (error: any) => {
            const errorMessage = error?.message || error?.response?.data?.message || "فشل إنشاء الإشعار"
            toast.error(errorMessage)
        },
    })

    // Create notification form
    const createForm = useForm<CreateNotificationFormValues>({
        resolver: zodResolver(createNotificationSchema),
        defaultValues: {
            title_ar: "",
            title_en: "",
            message_ar: "",
            message_en: "",
            type: "general_announcement",
        },
    })

    const handleCreateNotification = async (data: CreateNotificationFormValues) => {
        createNotificationMutation.mutate(data)
    }

    const handleMarkLastAsRead = () => {
        if (!notifications || notifications.length === 0) {
            toast.warning("لا توجد إشعارات")
            return
        }

        // Get the last (most recent) unread notification, or the last notification if all are read
        const lastUnreadNotification = notifications.find((n: Notification) => !n.is_read)
        const lastNotification = lastUnreadNotification || notifications[0] // First item is usually the most recent

        if (!lastNotification) {
            toast.warning("لا يوجد إشعار لتحديده")
            return
        }

        if (lastNotification.is_read) {
            toast.info("جميع الإشعارات مقروءة بالفعل")
            return
        }

        markLastAsReadMutation.mutate(lastNotification.id)
    }

    const unreadCount = notifications?.filter((n: Notification) => !n.is_read).length || 0

    return (
        <>
            <div className="space-y-6" dir="rtl">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">الإشعارات</h1>
                        <p className="text-muted-foreground mt-1">إدارة ومتابعة جميع الإشعارات</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="default"
                            onClick={() => setCreateDialogOpen(true)}
                            className="gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            إنشاء إشعار جديد
                        </Button>
                        {notifications && notifications.length > 0 && (
                            <Button
                                variant="outline"
                                onClick={handleMarkLastAsRead}
                                disabled={markLastAsReadMutation.isPending}
                                className="gap-2"
                            >
                                <CheckCheck className="h-4 w-4" />
                                {markLastAsReadMutation.isPending ? "جاري التحديد..." : "تحديد الكل كمقروء"}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="w-full" dir="rtl">
                    <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-fit">
                        <TabsTrigger
                            value="all"
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                        >
                            الكل
                            {filter === "all" && notifications && notifications.length > 0 && (
                                <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs">
                                    {notifications.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger
                            value="unread"
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                        >
                            غير مقروء
                            {filter === "unread" && notifications && notifications.length > 0 && (
                                <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs">
                                    {notifications.filter((n: Notification) => !n.is_read).length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger
                            value="read"
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                        >
                            مقروء
                            {filter === "read" && notifications && notifications.length > 0 && (
                                <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs">
                                    {notifications.filter((n: Notification) => n.is_read).length}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value={filter} className="mt-6">
                        {isLoading ? (
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                                        <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Skeleton className="h-4 w-16" />
                                                <Skeleton className="h-4 w-20" />
                                            </div>
                                            <Skeleton className="h-5 w-3/4" />
                                            <Skeleton className="h-4 w-full" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                                <div className="rounded-full bg-destructive/10 p-4 mb-4">
                                    <AlertCircle className="h-8 w-8 text-destructive" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">حدث خطأ في تحميل الإشعارات</h3>
                                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
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
                            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                                <div className="rounded-full bg-muted p-4 mb-4">
                                    <Bell className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">لا توجد إشعارات</h3>
                                <p className="text-sm text-muted-foreground">
                                    {filter === "unread"
                                        ? "جميع الإشعارات مقروءة"
                                        : filter === "read"
                                            ? "لا توجد إشعارات مقروءة"
                                            : "لم يتم العثور على أي إشعارات حتى الآن"}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {notifications
                                    .filter((notification: Notification) => filter === "all" || notification.is_read === (filter === "read"))
                                    .map((notification: Notification, index: number) => (
                                        <NotificationsCard
                                            key={notification.id}
                                            notification={notification}
                                            index={index}
                                            // handleMarkAsRead={handleMarkAsRead}
                                            // markAsReadMutation={markAsReadMutation}
                                            onViewDetails={() => {
                                                setSelectedNotification(notification)
                                                if (!notification.is_read) {
                                                    // handleMarkAsRead(notification.id)
                                                }
                                            }}
                                        />
                                    ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Details Dialog */}
            <Dialog open={!!selectedNotification} onOpenChange={(open) => !open && setSelectedNotification(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    {selectedNotification && <NotificationDetails notification={selectedNotification} />}
                </DialogContent>
            </Dialog>

            {/* Create Notification Dialog */}
            <Dialog
                open={createDialogOpen}
                onOpenChange={(open) => {
                    setCreateDialogOpen(open)
                    if (!open) {
                        createForm.reset()
                    }
                }}
            >
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>إنشاء إشعار جديد</DialogTitle>
                        <DialogDescription>
                            إرسال إشعار عام لجميع المستخدمين
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...createForm}>
                        <form onSubmit={createForm.handleSubmit(handleCreateNotification)} className="space-y-6">
                            {/* Type Selection */}
                            <FormField
                                control={createForm.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>نوع الإشعار</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="اختر نوع الإشعار" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="general_announcement">إعلان عام</SelectItem>
                                                <SelectItem value="info">معلومات</SelectItem>
                                                <SelectItem value="success">نجاح</SelectItem>
                                                <SelectItem value="warning">تحذير</SelectItem>
                                                <SelectItem value="error">خطأ</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Title Arabic */}
                            <FormField
                                control={createForm.control}
                                name="title_ar"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>العنوان (عربي) *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="أدخل عنوان الإشعار بالعربية" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Title English */}
                            <FormField
                                control={createForm.control}
                                name="title_en"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>العنوان (إنجليزي) *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter notification title in English" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Message Arabic */}
                            <FormField
                                control={createForm.control}
                                name="message_ar"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>الرسالة (عربي) *</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="أدخل محتوى الإشعار بالعربية"
                                                className="min-h-24"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Message English */}
                            <FormField
                                control={createForm.control}
                                name="message_en"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>الرسالة (إنجليزي) *</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter notification message in English"
                                                className="min-h-24"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setCreateDialogOpen(false)
                                        createForm.reset()
                                    }}
                                    disabled={createNotificationMutation.isPending}
                                >
                                    إلغاء
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={createNotificationMutation.isPending}
                                >
                                    {createNotificationMutation.isPending ? "جاري الإنشاء..." : "إنشاء الإشعار"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    )
}

function NotificationsCard({
    notification,
    index,
    // handleMarkAsRead, 
    // markAsReadMutation,
    onViewDetails
}: {
    notification: Notification
    index: number
    // handleMarkAsRead: (id: number) => void
    // markAsReadMutation: any
    onViewDetails: () => void
}) {
    const getTypeConfig = (notification: Notification) => {
        const type = notification.metadata?.type || "info"
        const configs = {
            info: {
                icon: Info,
                iconColor: "text-blue-600 dark:text-blue-400",
                bgColor: "bg-blue-50 dark:bg-blue-950/20",
            },
            success: {
                icon: CheckCircle2,
                iconColor: "text-green-600 dark:text-green-400",
                bgColor: "bg-green-50 dark:bg-green-950/20",
            },
            warning: {
                icon: AlertTriangle,
                iconColor: "text-yellow-600 dark:text-yellow-400",
                bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
            },
            error: {
                icon: AlertCircle,
                iconColor: "text-red-600 dark:text-red-400",
                bgColor: "bg-red-50 dark:bg-red-950/20",
            },
            general_announcement: {
                icon: Bell,
                iconColor: "text-purple-600 dark:text-purple-400",
                bgColor: "bg-purple-50 dark:bg-purple-950/20",
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

    const typeConfig = getTypeConfig(notification)
    const TypeIcon = typeConfig.icon

    return (
        <div
            className={cn(
                "group relative rounded-lg border bg-card p-4 transition-all hover:shadow-md cursor-pointer",
                !notification.is_read && "border-l-4 border-l-primary bg-primary/5 dark:bg-primary/10"
            )}
            onClick={onViewDetails}
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={cn(
                    "flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center",
                    typeConfig.bgColor
                )}>
                    <TypeIcon className={cn("h-5 w-5", typeConfig.iconColor)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <h4 className={cn(
                                "text-sm font-semibold text-foreground line-clamp-1",
                                !notification.is_read && "font-bold"
                            )}>
                                {notification.title}
                            </h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {notification.message}
                            </p>
                        </div>
                        {!notification.is_read && (
                            <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                        )}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(notification.created_at)}</span>
                        </div>
                        {notification.notificationable_type === "listing" && notification.notificationable_id && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs gap-1"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    window.location.href = `/listings/${notification.notificationable_id}`
                                }}
                            >
                                <Building2 className="h-3 w-3" />
                                #{notification.notificationable_id}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

/**
 * NotificationDetails Component
 * Displays comprehensive details of a notification including metadata and related information
 */
function NotificationDetails({ notification }: { notification: Notification }) {
    const router = useRouter()

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("ar-SA", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const handleNavigateToListing = () => {
        if (notification.notificationable_type === "listing" && notification.notificationable_id) {
            router.push(`/listings/${notification.notificationable_id}`)
        }
    }

    const listingId = notification.notificationable_id || notification.metadata?.data?.listing_id || notification.metadata?.notificationable?.id

    return (
        <div className="space-y-6" dir="rtl">
            <DialogHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <DialogTitle className="text-2xl mb-1">{notification.title}</DialogTitle>
                        <DialogDescription className="flex items-center gap-2 mt-2">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{formatDate(notification.created_at)}</span>
                            {notification.read_at && (
                                <>
                                    <span>•</span>
                                    <span>مقروء: {formatDate(notification.read_at)}</span>
                                </>
                            )}
                        </DialogDescription>
                    </div>
                    <Badge variant={notification.is_read ? "secondary" : "default"}>
                        {notification.is_read ? "مقروء" : "غير مقروء"}
                    </Badge>
                </div>
            </DialogHeader>

            <div className="space-y-4">
                {/* Message */}
                <div className="rounded-lg border bg-muted/30 p-4">
                    <p className="text-sm leading-relaxed text-foreground">{notification.message}</p>
                </div>

                {/* User Information */}
                {notification.user && (
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={notification.user.avatar_url} alt={notification.user.full_name} />
                                <AvatarFallback className="text-xs">
                                    {notification.user.first_name?.[0]}{notification.user.last_name?.[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{notification.user.full_name}</p>
                                <p className="text-xs text-muted-foreground truncate">{notification.user.email}</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Badge variant="outline" className="text-xs">
                                    {notification.user.role}
                                </Badge>
                            </div>
                        </div>
                    </div>
                )}

                {/* Listing Information */}
                {listingId && notification.notificationable_type === "listing" && (
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Building2 className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">الإعلان المرتبط</p>
                                    <p className="font-semibold text-sm">إعلان رقم #{listingId}</p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleNavigateToListing}
                                className="gap-1.5"
                            >
                                <span className="text-xs">عرض</span>
                                <ExternalLink className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Additional Metadata */}
                {notification.metadata?.data && Object.keys(notification.metadata.data).length > 0 && (
                    <div className="rounded-lg border bg-card p-4">
                        <p className="text-xs font-medium text-muted-foreground mb-3">بيانات إضافية</p>
                        <div className="space-y-2">
                            {Object.entries(notification.metadata.data).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between py-1.5 border-b last:border-0">
                                    <span className="text-xs text-muted-foreground capitalize">{key.replace(/_/g, " ")}</span>
                                    <span className="text-xs font-medium">{String(value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}