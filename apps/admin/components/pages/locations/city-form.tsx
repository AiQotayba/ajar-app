"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Building2, Languages } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { locationsApi } from "@/lib/api/locations"
import type { City } from "@/lib/types/location"

// Form validation schema
const cityFormSchema = z.object({
    governorate_id: z.number().min(1, "المحافظة مطلوبة"),
    name_ar: z.string().min(2, "اسم المدينة بالعربية يجب أن يكون حرفين على الأقل"),
    name_en: z.string().min(2, "اسم المدينة بالإنجليزية يجب أن يكون حرفين على الأقل"),
    place_id: z.string().optional(),
    availability: z.boolean().default(true),
})

type CityFormValues = z.infer<typeof cityFormSchema>

interface CityFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    urlEndpoint: string
    city?: City | null
    mode: "create" | "update"
}

export function CityForm({ open, onOpenChange, urlEndpoint, city, mode }: CityFormProps) {
    const queryClient = useQueryClient()

    // Fetch governorates
    const { data: governoratesData } = useQuery({
        queryKey: ["governorates"],
        queryFn: () => locationsApi.getAllGovernorates(),
    })

    const governorates = (governoratesData?.data || []) as any[]

    const form = useForm<CityFormValues>({
        resolver: zodResolver(cityFormSchema),
        defaultValues: {
            governorate_id: city?.governorate_id || 0,
            name_ar: city?.name?.ar || "",
            name_en: city?.name?.en || "",
            place_id: city?.code || "",
            availability: city?.is_active ?? true,
        },
    })

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: any) => locationsApi.createCity(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["table-data", urlEndpoint] })
            onOpenChange(false)
            form.reset()
        },
        onError: (error: any) => {
            console.error("حدث خطأ أثناء إضافة المدينة:", error)
        },
    })

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (data: any) => locationsApi.updateCity(city!.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["table-data", urlEndpoint] })
            onOpenChange(false)
        },
        onError: (error: any) => {
            console.error("حدث خطأ أثناء تحديث المدينة:", error)
        },
    })

    const onSubmit = (values: CityFormValues) => {
        const formattedData = {
            governorate_id: values.governorate_id,
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
        if (city && mode === "update") {
            form.reset({
                governorate_id: city.governorate_id,
                name_ar: city.name.ar,
                name_en: city.name.en,
                place_id: city.code || "",
                availability: city.is_active ?? true,
            })
        }
    }, [city, mode, form])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        {mode === "create" ? "إضافة مدينة جديدة" : "تعديل المدينة"}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === "create"
                            ? "قم بإضافة مدينة جديدة للنظام"
                            : "قم بتعديل بيانات المدينة"}
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
                                            <FormLabel>اسم المدينة بالعربية</FormLabel>
                                            <FormControl>
                                                <Input placeholder="الكرخ" {...field} />
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
                                            <FormLabel>City Name in English</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Al-Karkh" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>
                        </Tabs>

                        <FormField
                            control={form.control}
                            name="governorate_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>المحافظة</FormLabel>
                                    <Select
                                        onValueChange={(value) => field.onChange(parseInt(value))}
                                        value={field.value?.toString()}
                                        dir="rtl"
                                    >
                                        <FormControl className="w-full">
                                            <SelectTrigger>
                                                <SelectValue placeholder="اختر المحافظة" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {governorates.map((gov: any) => (
                                                <SelectItem key={gov.id} value={gov.id.toString()}>
                                                    {gov.name.ar}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
                                        <FormLabel className="text-base">تفعيل المدينة</FormLabel>
                                        <FormDescription>
                                            عند التفعيل، ستكون المدينة متاحة للاختيار
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

