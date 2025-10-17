"use client"

import * as React from "react"
import { User as UserIcon, Shield, CheckCircle, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { TableColumn } from "@/components/table/table-core"
import type { User } from "@/lib/types/user"
import { format } from "date-fns"
import { ar } from "date-fns/locale"

// Get role config
export const getRoleConfig = (role: string) => {
    const roleConfigs = {
        admin: { label: "مدير", className: "bg-red-500 text-white", icon: Shield },
        user: { label: "مستخدم", className: "bg-gray-500 text-white", icon: UserIcon },
    }
    return roleConfigs[role as keyof typeof roleConfigs] || roleConfigs.user
}

// Get status config
export const getStatusConfig = (status: string) => {
    const statusConfigs = {
        active: { label: "نشط", className: "bg-green-500 text-white" },
        banned: { label: "محظور", className: "bg-red-500 text-white" },
    }
    return statusConfigs[status as keyof typeof statusConfigs] || statusConfigs.active
}

// Columns definition for users table
export const getUsersColumns = (): TableColumn<User>[] => [
    {
        key: "full_name",
        label: "المستخدم",
        sortable: true,
        width: "min-w-[250px]",
        render: (value, row) => {
            const name = value || "غير معروف"
            const initials = name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .substring(0, 2)

            const statusConfig = getStatusConfig(row.status)
            const statusColors = {
                active: "bg-green-500",
                banned: "bg-red-500"
            }

            return (
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={row.avatar_url || undefined} className="object-cover" />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        {/* Status indicator */}
                        <span
                            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${statusColors[row.status as keyof typeof statusColors] || statusColors.active}`}
                            title={statusConfig.label}
                        />
                    </div>
                    <div>
                        <p className="font-semibold text-foreground" dir="rtl">
                            {name}
                        </p>
                    </div>
                </div>
            )
        },
    },
    {
        key: "phone",
        label: "الهاتف",
        sortable: false,
        width: "w-40",
        render: (value) => (
            <p className="text-sm text-end text-foreground font-mono" dir="ltr">
                {value || "-"}
            </p>
        ),
    },
    {
        key: "role",
        label: "الدور",
        sortable: true,
        width: "w-32",
        render: (value) => {
            const config = getRoleConfig(value)
            const Icon = config.icon
            return (
                <Badge className={config.className}>
                    <Icon className="h-3 w-3 ml-1" />
                    {config.label}
                </Badge>
            )
        },
    },
    {
        key: "phone_verified",
        label: "التوثيق",
        sortable: true,
        width: "w-28",
        render: (value, row) => {
            return value ? (
                <Badge className="bg-green-500 text-white">
                    <CheckCircle className="h-3 w-3 ml-1" />
                    موثق
                </Badge>
            ) : (
                <Badge variant="secondary" className="bg-gray-500 text-white">
                    <XCircle className="h-3 w-3 ml-1" />
                    غير موثق
                </Badge>
            )
        },
    },
]

