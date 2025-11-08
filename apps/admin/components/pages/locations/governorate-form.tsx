"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { MapPin, Languages } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api } from "@/lib/api"
import type { Governorate } from "@/lib/types/location"

// Form validation schema
const governorateFormSchema = z.object({
    name_ar: z.string().min(2, "اسم المحافظة بالعربية يجب أن يكون حرفين على الأقل"),
    name_en: z.string().min(2, "اسم المحافظة بالإنجليزية يجب أن يكون حرفين على الأقل"),
    place_id: z.string().optional(),
    availability: z.boolean().default(true),
})

type GovernorateFormValues = z.infer<typeof governorateFormSchema>

interface GovernorateFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    urlEndpoint: string
    governorate?: Governorate | null
    mode: "create" | "update"
}

export function GovernorateForm({ open, onOpenChange, urlEndpoint, governorate, mode }: GovernorateFormProps) {
    const queryClient = useQueryClient()
    
    const form = useForm<GovernorateFormValues>({
        resolver: zodResolver(governorateFormSchema),
        defaultValues: {
            name_ar: governorate?.name?.ar || "",
            name_en: governorate?.name?.en || "",
            place_id: governorate?.code || "",
            availability: governorate?.is_active ?? true,
        },
    })

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: any) => api.post(`/admin/governorates`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["table-data", urlEndpoint] })
            onOpenChange(false)
            form.reset()
        },
        onError: (error: any) => {
            console.error("حدث خطأ أثناء إضافة المحافظة:", error)
        },
    })

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (data: any) => api.put(`/admin/governorates/${governorate!.id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["table-data", urlEndpoint] })
            onOpenChange(false)
        },
        onError: (error: any) => {
            console.error("حدث خطأ أثناء تحديث المحافظة:", error)
        },
    })

    const onSubmit = (values: GovernorateFormValues) => {
        const formattedData = {
            name: {
                ar: values.name_ar,
                en: values.name_en,
            },
            place_id: values.place_id,
            availability: values.availability,
        }

        if (mode === "create") {
            createMutation.mutate(formattedData)
        } else {
            updateMutation.mutate(formattedData)
        }
    }

    const isLoading = createMutation.isPending || updateMutation.isPending

    React.useEffect(() => {
        if (governorate && mode === "update") {
            form.reset({
                name_ar: governorate.name.ar,
                name_en: governorate.name.en,
                place_id: governorate.code || "",
                availability: governorate.is_active ?? true,
            })
        }
    }, [governorate, mode, form])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        {mode === "create" ? "إضافة محافظة جديدة" : "تعديل المحافظة"}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === "create" 
                            ? "قم بإضافة محافظة جديدة للنظام"
                            : "قم بتعديل بيانات المحافظة"}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Tabs defaultValue="ar" dir="rtl">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="ar" className="gap-2">
                                    <Languages className="h-4 w-4" />
                                    العربية
                                </TabsTrigger>
                                <TabsTrigger value="en" className="gap-2">
                                    <Languages className="h-4 w-4" />
                                    English
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="ar" className="space-y-4 mt-4">
                                <FormField
                                    control={form.control}
                                    name="name_ar"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>اسم المحافظة بالعربية</FormLabel>
                                            <FormControl>
                                                <Input placeholder="بغداد" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>

                            <TabsContent value="en" className="space-y-4 mt-4">
                                <FormField
                                    control={form.control}
                                    name="name_en"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Governorate Name in English</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Baghdad" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>
                        </Tabs>

                        <FormField
                            control={form.control}
                            name="place_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>معرّف المكان (Place ID)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="ChIJXYZ123456789" {...field} />
                                    </FormControl>
                                    <FormDescription>كود Google Places API (اختياري)</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="availability"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">تفعيل المحافظة</FormLabel>
                                        <FormDescription>
                                            عند التفعيل، ستكون المحافظة متاحة للاختيار
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

