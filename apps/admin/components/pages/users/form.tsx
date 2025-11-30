"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { User as UserIcon, Phone } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input"
import "react-phone-number-input/style.css"
import "@/styles/phone-input.css"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ImageUpload } from "@/components/ui/image-upload"
import type { User } from "@/lib/types/user"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { ApiResponse } from "@/lib/api-client"

// Form validation schema - for create
const createUserSchema = z.object({
    first_name: z.string().min(2, "الاسم الأول يجب أن يكون حرفين على الأقل"),
    last_name: z.string().min(2, "الاسم الأخير يجب أن يكون حرفين على الأقل"),
    email: z.string().optional(),
    phone: z.string()
        .min(1, "رقم الهاتف مطلوب")
        .refine((val) => isValidPhoneNumber(val), {
            message: "رقم الهاتف غير صحيح"
        }),
    password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
    password_confirmation: z.string().min(8, "تأكيد كلمة المرور يجب أن يكون 8 أحرف على الأقل"),
    avatar: z.string().optional().or(z.literal("")),
    role: z.enum(["admin", "user"]),
    status: z.enum(["active", "banned"]),
    phone_verified: z.boolean().default(false),
    language: z.string().optional().or(z.literal("")),
}).refine((data) => data.password === data.password_confirmation, {
    message: "كلمة المرور غير متطابقة",
    path: ["password_confirmation"],
})

// Form validation schema - for update
const updateUserSchema = z.object({
    first_name: z.string().min(2, "الاسم الأول يجب أن يكون حرفين على الأقل"),
    last_name: z.string().min(2, "الاسم الأخير يجب أن يكون حرفين على الأقل"),
    email: z.string().optional(),
    phone: z.string()
        .min(1, "رقم الهاتف مطلوب")
        .refine((val) => isValidPhoneNumber(val), {
            message: "رقم الهاتف غير صحيح"
        }),
    avatar: z.string().optional().or(z.literal("")),
    role: z.enum(["admin", "user"]),
    status: z.enum(["active", "banned"]),
    phone_verified: z.boolean().default(false),
    language: z.string().optional().or(z.literal("")),
})

type CreateUserFormValues = z.infer<typeof createUserSchema>
type UpdateUserFormValues = z.infer<typeof updateUserSchema>
type UserFormValues = CreateUserFormValues | UpdateUserFormValues

interface UserFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    urlEndpoint: string
    user?: User | null
    mode: "create" | "update"
}

export function UserForm({ open, onOpenChange, urlEndpoint, user, mode }: UserFormProps) {
    const queryClient = useQueryClient()

    const form = useForm<UserFormValues>({
        resolver: zodResolver(mode === "create" ? createUserSchema : updateUserSchema),
        defaultValues: mode === "create" ? {
            first_name: "",
            last_name: "",
            email: "",
            phone: "",
            password: "",
            password_confirmation: "",
            avatar: "",
            role: "user",
            status: "active",
            phone_verified: false,
            language: "ar",
        } : {
            first_name: user?.first_name || "",
            last_name: user?.last_name || "",
            email: user?.email || "",
            phone: user?.phone ? (() => {
                // Remove all leading + signs and add only one
                const cleanPhone = user.phone.replace(/^\+*/, '')
                return cleanPhone ? `+${cleanPhone}` : ""
            })() : "",
            avatar: user?.avatar || "",
            role: user?.role || "user",
            status: user?.status || "active",
            phone_verified: user?.phone_verified || false,
            language: user?.language || "ar",
        },
    })
console.log(user?.phone);

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: CreateUserFormValues) => api.post(`/admin/users`, data),
        onSuccess: (response: ApiResponse<User>) => {
            console.info("📥 Create User Response:", response)

            // Check if response indicates an error
            if (response?.isError || (response?.status && response.status >= 400)) {
                console.error("❌ Create User Failed:", response)

                // Handle validation errors
                if (response?.errors) {
                    const firstError = Object.values(response.errors)[0]
                    const errorMessage = Array.isArray(firstError) ? firstError[0] : response.message
                    toast.error(errorMessage)
                } else {
                    toast.error(response?.message || "حدث خطأ أثناء إضافة المستخدم")
                }
                return
            }

            console.info("✅ Create User Success")
            queryClient.invalidateQueries({ queryKey: ["table-data", urlEndpoint] })
            onOpenChange(false)
            form.reset()
            toast.success(response?.message || "تم إضافة المستخدم بنجاح")
        },
        onError: (error: ApiResponse<User>) => {
            console.error("❌ Create User Error:", error)
            const errorMessage = error?.response?.data?.message || error?.message || "حدث خطأ أثناء إضافة المستخدم"
            toast.error(errorMessage)
        },
    })

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (data: UpdateUserFormValues) => api.put(`/admin/users/${user!.id}`, data),
        onSuccess: (response: ApiResponse<User>) => {
            console.info("📥 Update User Response:", response)

            // Check if response indicates an error
            if (response?.isError || (response?.status && response.status >= 400)) {
                console.error("❌ Update User Failed:", response)

                // Handle validation errors
                if (response?.errors) {
                    const firstError = Object.values(response.errors)[0]
                    const errorMessage = Array.isArray(firstError) ? firstError[0] : response.message
                    toast.error(errorMessage)
                } else {
                    toast.error(response?.message || "حدث خطأ أثناء تحديث المستخدم")
                }
                return
            }

            console.info("✅ Update User Success")
            queryClient.invalidateQueries({ queryKey: ["table-data", urlEndpoint] })
            onOpenChange(false)
            toast.success(response?.message || "تم تحديث المستخدم بنجاح")
        },
        onError: (error: ApiResponse<User>) => {
            console.error("❌ Update User Error:", error)
            const errorMessage = error?.response?.data?.message || error?.message || "حدث خطأ أثناء تحديث المستخدم"
            toast.error(errorMessage)
        },
    })

    const onSubmit = (values: UserFormValues) => {
        // Remove all + signs from phone number before sending
        const cleanPhone = values.phone ? values.phone.replace(/\+/g, '') : ""
        const submitData: CreateUserFormValues | UpdateUserFormValues = {
            ...values,
            phone: cleanPhone
        }

        console.info("📤 Submitting User Data:", submitData)

        if (mode === "create") {
            createMutation.mutate(submitData as CreateUserFormValues)
        } else {
            updateMutation.mutate(submitData)
        }
    }

    const isLoading = createMutation.isPending || updateMutation.isPending

    React.useEffect(() => {
        if (user && mode === "update") {
            // Remove any existing + signs and add only one
            const cleanPhone = user.phone ? user.phone.replace(/^\+*/, '') : ""
            form.reset({
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email || "",
                phone: cleanPhone ? `+${cleanPhone}` : "",
                avatar: user.avatar || "",
                role: user.role,
                status: user.status,
                phone_verified: user.phone_verified,
                language: user.language || "ar",
            })
        }
    }, [user, mode, form])

    // Reset form when dialog closes
    React.useEffect(() => {
        if (!open) {
            if (mode === "create") {
                form.reset({
                    first_name: "",
                    last_name: "",
                    email: "",
                    phone: "",
                    password: "",
                    password_confirmation: "",
                    avatar: "",
                    role: "user",
                    status: "active",
                    phone_verified: false,
                    language: "ar",
                })
            }
        }
    }, [open, form, mode])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserIcon className="h-5 w-5" />
                        {mode === "create" ? "إضافة مستخدم جديد" : "تعديل المستخدم"}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === "create"
                            ? "قم بإضافة مستخدم جديد للنظام"
                            : "قم بتعديل بيانات المستخدم"}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Avatar Upload */}
                        <FormField
                            control={form.control}
                            name="avatar"
                            render={({ field }) => (
                                <FormItem className="flex flex-col items-center">
                                    <FormLabel>الصورة الشخصية</FormLabel>
                                    <FormControl>
                                        <div className="w-[150px] h-[150px] rounded-3xl overflow-hidden">
                                            <ImageUpload
                                                value={field.value}
                                                onChange={field.onChange}
                                                folder="users"
                                                aspectRatio="square"
                                                maxSize={2}
                                                disabled={isLoading}
                                                className="*:rounded-3xl"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormDescription>
                                        صورة شخصية للمستخدم (اختياري، حد أقصى 2MB)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="first_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>الاسم الأول</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="أدخل الاسم الأول"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="last_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>الاسم الأخير</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="أدخل الاسم الأخير"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>البريد الإلكتروني</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="example@domain.com"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {mode === "create" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>كلمة المرور</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="8 أحرف على الأقل"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password_confirmation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>تأكيد كلمة المرور</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="أعد إدخال كلمة المرور"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4">
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>رقم الهاتف</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
                                                <PhoneInput
                                                    {...field}
                                                    international
                                                    defaultCountry="SY"
                                                    placeholder="رقم الهاتف"
                                                    className="h-10 pl-4 pr-12 rounded-lg border border-border focus-within:border-primary text-foreground [&_input]:h-11 [&_input]:rounded-lg [&_input]:border-0 [&_input]:bg-transparent [&_input]:px-4 [&_input]:text-foreground [&_input]:placeholder:text-muted-foreground [&_.PhoneInputCountry]:px-4"
                                                    disabled={isLoading}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>


                        <div className="grid grid-cols-2 md:grid-cols-3 items-start gap-4">
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>الدور</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            dir="rtl"
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="اختر الدور" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="admin">مدير</SelectItem>
                                                <SelectItem value="user">مستخدم</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription className="text-xs text-muted-foreground">
                                            صلاحيات المستخدم في النظام
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="language"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>اللغة</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            dir="rtl"
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="اختر اللغة" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="ar">العربية</SelectItem>
                                                <SelectItem value="en">English</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col gap-2">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">
                                                حالة الحساب
                                            </FormLabel>
                                        </div>
                                        <FormControl className="flex flex-row items-center justify-between">
                                            <div className="flex flex-row items-center justify-start gap-2">
                                                <Switch
                                                    checked={field.value === "active"}
                                                    onCheckedChange={(checked) =>
                                                        field.onChange(checked ? "active" : "banned")
                                                    }
                                                />
                                                <FormDescription className="text-xs">
                                                    {field.value === "active" ? "نشط" : "محظور"}
                                                </FormDescription>
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="phone_verified"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            رقم هاتف موثق
                                        </FormLabel>
                                        <FormDescription>
                                            هل تم التحقق من رقم الهاتف للمستخدم؟
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                            >
                                إلغاء
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "جاري الحفظ..." : mode === "create" ? "إضافة" : "تحديث"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

