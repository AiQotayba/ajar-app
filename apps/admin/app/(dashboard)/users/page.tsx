"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Plus, Users as UsersIcon } from "lucide-react"
import { TableCore, type TableFilter } from "@/components/table/table-core"
import { usersApi } from "@/lib/api/users"
import type { User } from "@/lib/types/user"
import { PageHeader } from "@/components/dashboard/page-header"
import { getUsersColumns, UserForm, UserView } from "@/components/pages/users"
import { toast } from "sonner"

export default function UsersPage() {
    const queryClient = useQueryClient()
    const [formOpen, setFormOpen] = React.useState(false)
    const [viewOpen, setViewOpen] = React.useState(false)
    const [selectedUser, setSelectedUser] = React.useState<User | null>(null)
    const [formMode, setFormMode] = React.useState<"create" | "update">("create")

    const urlEndpoint = "/admin/users"
    const columns = getUsersColumns()

    const filters: TableFilter[] = [
        {
            key: "role",
            label: "الدور",
            type: "select",
            options: [
                { label: "مدير", value: "admin" }, 
                { label: "مستخدم", value: "user" },
            ],
        },
        {
            key: "status",
            label: "الحالة",
            type: "select",
            options: [
                { label: "نشط", value: "active" },
                { label: "محظور", value: "banned" },
            ],
        },
        {
            key: "phone_verified",
            label: "التوثيق",
            type: "select",
            options: [
                { label: "موثق", value: "true" },
                { label: "غير موثق", value: "false" },
            ],
        },
    ]

    const handleView = (user: User) => {
        setSelectedUser(user)
        setViewOpen(true)
    }

    const handleEdit = (user: User) => {
        setSelectedUser(user)
        setFormMode("update")
        setFormOpen(true)
    }

    const handleCreate = () => {
        setSelectedUser(null)
        setFormMode("create")
        setFormOpen(true)
    }

    const handleDelete = async (user: User) => {
        try {
            console.info("📤 Deleting User:", { id: user.id, name: user.full_name })
            const response = await usersApi.delete(user.id)
            console.info("📥 Delete User Response:", response)
            
            // Check if response indicates an error
            if (response?.isError || (response?.status && response.status >= 400)) {
                console.error("❌ Delete User Failed:", response)
                toast.error(response?.message || "حدث خطأ أثناء حذف المستخدم")
                return
            }
            
            console.info("✅ Delete User Success")
            queryClient.invalidateQueries({ queryKey: ["table-data", urlEndpoint] })
            toast.success(response?.message || "تم حذف المستخدم بنجاح")
        } catch (error: any) {
            console.error("❌ Delete User Error:", error)
            const errorMessage = error?.response?.data?.message || error?.message || "حدث خطأ أثناء حذف المستخدم"
            toast.error(errorMessage)
        }
    }

    return (
        <div className="space-y-4 md:space-y-6">
            <PageHeader
                title="المستخدمين"
                description="إدارة المستخدمين وصلاحياتهم في النظام"
                icon={UsersIcon}
                actions={[
                    {
                        label: "إضافة مستخدم جديد",
                        icon: Plus,
                        onClick: handleCreate,
                    }
                ]}
            />

            <TableCore<User>
                columns={columns}
                filters={filters}
                apiEndpoint={urlEndpoint}
                enableDragDrop={false}
                enableActions={true}
                enableSortOrder={false}
                actions={{
                    onView: handleView,
                    onEdit: handleEdit,
                }}
                enableDelete={true}
                enableDateRange={true}
                searchPlaceholder="ابحث عن المستخدمين..."
                emptyMessage="لا يوجد مستخدمين."
                skeletonRows={10}
                skeletonVariant="comfortable"
                deleteTitle="تأكيد حذف المستخدم"
                deleteDescription={(user) => `هل أنت متأكد من حذف المستخدم "${user.full_name}"؟`}
                deleteWarning={(user) =>
                    user.role === "admin"
                        ? "تحذير: هذا مستخدم مدير، حذفه قد يؤثر على إدارة النظام"
                        : null
                }
                onDeleteConfirm={handleDelete}
            />

            {/* User Form Dialog */}
            <UserForm
                open={formOpen}
                onOpenChange={setFormOpen}
                urlEndpoint={urlEndpoint}
                user={selectedUser}
                mode={formMode}
            />

            {/* User View Dialog */}
            <UserView
                open={viewOpen}
                onOpenChange={setViewOpen}
                urlEndpoint={urlEndpoint}
                user={selectedUser}
            />
        </div>
    )
}

