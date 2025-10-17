"use client"

import * as React from "react"
import {
    User as UserIcon,
    Calendar,
    Phone,
    Shield,
    CheckCircle,
    XCircle,
} from "lucide-react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import type { User } from "@/lib/types/user"
import { getRoleConfig, getStatusConfig } from "./columns"

interface UserViewProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    urlEndpoint: string
    user: User | null
}

export function UserView({ open, onOpenChange, urlEndpoint, user }: UserViewProps) {
    if (!user) return null

    const roleConfig = getRoleConfig(user.role)
    const statusConfig = getStatusConfig(user.status)
    const RoleIcon = roleConfig.icon

    const userName = user.full_name || "غير معروف"
    const initials = userName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg p-0 overflow-hidden">
                {/* Header */}
                <div className="flex flex-col items-center justify-center gap-3 bg-muted/40 p-6 border-b">
                    <Avatar className="h-20 w-20 shadow-sm">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                            {initials}
                        </AvatarFallback>
                    </Avatar>

                    <div className="text-center">
                        <h2 className="text-lg font-semibold">{userName}</h2>
                    </div>

                    <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                            <RoleIcon className="h-3 w-3" />
                            {roleConfig.label}
                        </Badge>
                        <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
                        {user.phone_verified && (
                            <Badge className="bg-green-500 text-white flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" /> موثق
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Info Body */}
                <div className="p-6 space-y-6">
                    {/* Contact */}
                    <section>
                        <h3 className="text-xs font-semibold text-muted-foreground mb-2">
                            معلومات الاتصال
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 rounded-lg border p-3">
                                <Phone className="h-4 w-4 text-primary" />
                                <div>
                                    <p className="text-[10px] text-muted-foreground">رقم الهاتف</p>
                                    <p className="text-sm font-mono" dir="ltr">
                                        {user.phone || "-"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 rounded-lg border p-3">
                                {user.phone_verified ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                    <XCircle className="h-4 w-4 text-orange-500" />
                                )}
                                <div>
                                    <p className="text-[10px] text-muted-foreground">توثيق الهاتف</p>
                                    <p className="text-sm font-semibold">
                                        {user.phone_verified ? "موثق" : "غير موثق"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Account Info */}
                    <section>
                        <h3 className="text-xs font-semibold text-muted-foreground mb-2">
                            حالة الحساب
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <InfoBox
                                icon={<Shield className="h-4 w-4 text-primary" />}
                                label="الدور"
                                value={roleConfig.label}
                            />
                            <InfoBox
                                icon={<UserIcon className="h-4 w-4 text-primary" />}
                                label="الحالة"
                                value={statusConfig.label}
                            />
                        </div>
                    </section>

                    {/* Dates */}
                    <section>
                        <h3 className="text-xs font-semibold text-muted-foreground mb-2">
                            التواريخ
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
                            <DateItem label="تاريخ التسجيل" value={user.created_at} />
                            <DateItem label="آخر تحديث" value={user.updated_at} />
                            {user.last_login && <DateItem label="آخر تسجيل دخول" value={user.last_login} />}
                        </div>
                    </section>

                </div>
            </DialogContent>
        </Dialog>
    )
}

/** Mini Components */
function InfoBox({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode
    label: string
    value: string
}) {
    return (
        <div className="flex items-center gap-2 rounded-lg border p-3">
            {icon}
            <div>
                <p className="text-[10px] text-muted-foreground">{label}</p>
                <p className="text-sm font-medium">{value}</p>
            </div>
        </div>
    )
}

function DateItem({ label, value }: { label: string; value: string | Date }) {
    return (
        <div>
            <p className="font-medium">{label}</p>
            <p>
                {format(new Date(value), "dd MMM yyyy - HH:mm", {
                    locale: ar,
                })}
            </p>
        </div>
    )
}
