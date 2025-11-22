"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Settings as SettingsIcon } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Calendar } from "lucide-react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import type { Setting } from "@/lib/types/setting"

// Form validation schema
const settingFormSchema = z.object({
    key: z.string().min(2, "المفتاح يجب أن يكون حرفين على الأقل"),
    value: z.string().min(1, "القيمة مطلوبة"),
    type: z.enum(["text", "long_text", "int", "float", "bool", "json", "datetime", "html"]),
}).refine((data) => {
    // Validate JSON if type is json
    if (data.type === "json") {
        try {
            JSON.parse(data.value)
            return true
        } catch {
            return false
        }
    }
    return true
}, {
    message: "JSON غير صالح. تأكد من صحة التنسيق",
    path: ["value"],
})

type SettingFormValues = z.infer<typeof settingFormSchema>

interface SettingFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    urlEndpoint: string
    setting?: Setting | null
    mode: "create" | "update"
}

export function SettingForm({ open, onOpenChange, urlEndpoint, setting, mode }: SettingFormProps) {
    const queryClient = useQueryClient()
    
    const form = useForm<SettingFormValues>({
        resolver: zodResolver(settingFormSchema),
        defaultValues: {
            key: setting?.key || "",
            value: setting?.value || "",
            type: setting?.type || "text",
        },
    })

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: any) => api.post(`/admin/settings`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["table-data", urlEndpoint] })
            onOpenChange(false)
            form.reset()
        },
        onError: (error: any) => {
            console.error("حدث خطأ أثناء إضافة الإعداد:", error)
        },
    })

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (data: any) => api.put(`/admin/settings/${setting!.id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["table-data", urlEndpoint] })
            onOpenChange(false)
        },
        onError: (error: any) => {
            console.error("حدث خطأ أثناء تحديث الإعداد:", error)
        },
    })

    const onSubmit = (values: SettingFormValues) => {
        if (mode === "create") {
            createMutation.mutate(values)
        } else {
            updateMutation.mutate(values)
        }
    }

    const isLoading = createMutation.isPending || updateMutation.isPending

    React.useEffect(() => {
        if (setting && mode === "update") {
            form.reset({
                key: setting.key,
                value: setting.value,
                type: setting.type,
            })
        }
    }, [setting, mode, form])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <SettingsIcon className="h-5 w-5" />
                        {mode === "create" ? "إضافة إعداد جديد" : "تعديل الإعداد"}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === "create" 
                            ? "قم بإضافة إعداد جديد للتطبيق"
                            : "قم بتعديل بيانات الإعداد"}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[80vh] overflow-y-auto">
                        <FormField
                            control={form.control}
                            name="key"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>مفتاح الإعداد (Key)</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="app_name" 
                                            disabled={mode === "update"}
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        {mode === "create" 
                                            ? "المفتاح الفريد للإعداد (بالإنجليزية، مثل: app_name)"
                                            : "لا يمكن تعديل المفتاح بعد الإنشاء"}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>نوع الإعداد</FormLabel>
                                    <Select 
                                        onValueChange={field.onChange} 
                                        defaultValue={field.value}
                                        disabled={mode === "update"}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="اختر نوع الإعداد" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="text">نص عادي (Text)</SelectItem>
                                            <SelectItem value="long_text">نص طويل (Long Text)</SelectItem>
                                            <SelectItem value="int">رقم صحيح (Integer)</SelectItem>
                                            <SelectItem value="float">رقم عشري (Float)</SelectItem>
                                            <SelectItem value="bool">صح/خطأ (Boolean)</SelectItem>
                                            <SelectItem value="json">بيانات JSON</SelectItem>
                                            <SelectItem value="datetime">تاريخ ووقت (DateTime)</SelectItem>
                                            <SelectItem value="html">كود HTML</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        {mode === "create"
                                            ? "نوع البيانات المخزنة في هذا الإعداد"
                                            : "لا يمكن تعديل النوع بعد الإنشاء"}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="value"
                            render={({ field }) => {
                                const selectedType = form.watch("type")
                                
                                return (
                                    <FormItem>
                                        <FormLabel>القيمة</FormLabel>
                                        <FormControl>
                                            {selectedType === "bool" ? (
                                                <div className="flex items-center justify-between rounded-lg border p-4">
                                                    <div className="space-y-0.5">
                                                        <p className="text-sm font-medium">الحالة</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {field.value === "true" ? "مفعّل" : "معطّل"}
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={field.value === "true"}
                                                        onCheckedChange={(checked) => 
                                                            field.onChange(checked ? "true" : "false")
                                                        }
                                                    />
                                                </div>
                                            ) : selectedType === "int" ? (
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="0"
                                                    {...field}
                                                />
                                            ) : selectedType === "float" ? (
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    {...field}
                                                />
                                            ) : selectedType === "datetime" ? (
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                "w-full justify-start text-right font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(new Date(field.value), "PPP - HH:mm", { locale: ar })
                                                            ) : (
                                                                <span>اختر التاريخ والوقت</span>
                                                            )}
                                                            <Calendar className="mr-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <CalendarComponent
                                                            mode="single"
                                                            selected={field.value ? new Date(field.value) : undefined}
                                                            onSelect={(date) => 
                                                                field.onChange(date ? date.toISOString() : "")
                                                            }
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            ) : selectedType === "json" ? (
                                                <Textarea
                                                    placeholder='{"key": "value"}'
                                                    className="min-h-[150px] font-mono text-sm"
                                                    {...field}
                                                />
                                            ) : selectedType === "html" ? (
                                                <Textarea
                                                    placeholder="<div>HTML content</div>"
                                                    className="min-h-[200px] font-mono text-sm"
                                                    {...field}
                                                />
                                            ) : selectedType === "long_text" ? (
                                                <Textarea
                                                    placeholder="نص طويل متعدد الأسطر..."
                                                    className="min-h-[200px]"
                                                    {...field}
                                                />
                                            ) : (
                                                <Input
                                                    placeholder="قيمة الإعداد"
                                                    {...field}
                                                />
                                            )}
                                        </FormControl>
                                        <FormDescription>
                                            {selectedType === "text" && "نص قصير (سطر واحد)"}
                                            {selectedType === "long_text" && "نص طويل متعدد الأسطر"}
                                            {selectedType === "int" && "رقم صحيح (بدون فواصل عشرية)"}
                                            {selectedType === "float" && "رقم عشري (مع فواصل)"}
                                            {selectedType === "bool" && "استخدم المفتاح للتبديل بين true و false"}
                                            {selectedType === "json" && "أدخل JSON صالح"}
                                            {selectedType === "datetime" && "اختر تاريخ ووقت"}
                                            {selectedType === "html" && "كود HTML (احذر من XSS)"}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
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

