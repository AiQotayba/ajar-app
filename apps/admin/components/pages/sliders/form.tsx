"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Calendar, Image as ImageIcon, Link2, Languages } from "lucide-react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageUpload } from "@/components/ui/image-upload"
import { cn } from "@/lib/utils"
import { slidersApi } from "@/lib/api/sliders"
import type { Slider } from "@/lib/types/slider"

// Form validation schema
const sliderFormSchema = z.object({
    title_ar: z.string().min(3, "العنوان بالعربية يجب أن يكون 3 أحرف على الأقل"),
    title_en: z.string().min(3, "العنوان بالإنجليزية يجب أن يكون 3 أحرف على الأقل"),
    description_ar: z.string().min(10, "الوصف بالعربية يجب أن يكون 10 أحرف على الأقل"),
    description_en: z.string().min(10, "الوصف بالإنجليزية يجب أن يكون 10 أحرف على الأقل"),
    image_url: z.string().min(1, "يجب رفع صورة السلايد"), // Can be image_name (path) or full URL
    target_url: z.string().url("يجب إدخال رابط صحيح"),
    start_at: z.date({
        required_error: "يجب تحديد تاريخ البداية",
    }),
    end_at: z.date({
        required_error: "يجب تحديد تاريخ النهاية",
    }),
    active: z.boolean().default(true),
}).refine((data) => data.end_at > data.start_at, {
    message: "تاريخ النهاية يجب أن يكون بعد تاريخ البداية",
    path: ["end_at"],
})

type SliderFormValues = z.infer<typeof sliderFormSchema>

interface SliderFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    urlEndpoint: string
    slider?: Slider | null
    mode: "create" | "update"
}

export function SliderForm({ open, onOpenChange, urlEndpoint, slider, mode }: SliderFormProps) {
    const queryClient = useQueryClient()
    
    const form = useForm<SliderFormValues>({
        resolver: zodResolver(sliderFormSchema),
        defaultValues: {
            title_ar: slider?.title.ar || "",
            title_en: slider?.title.en || "",
            description_ar: slider?.description.ar || "",
            description_en: slider?.description.en || "",
            image_url: slider?.image_url || "",
            target_url: slider?.target_url || "",
            start_at: slider?.start_at ? new Date(slider.start_at) : new Date(),
            end_at: slider?.end_at ? new Date(slider.end_at) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            active: slider?.active ?? true,
        },
    })

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: any) => slidersApi.create(data),
        onSuccess: () => {
            // Invalidate all table-data queries for this endpoint
            queryClient.invalidateQueries({ queryKey: ["table-data", urlEndpoint] })
            // toast.success("تم إضافة السلايد بنجاح")
            onOpenChange(false)
            form.reset()
        },
        onError: (error: any) => {
            toast.error("حدث خطأ أثناء إضافة السلايد", {
                description: error.message,
            })
        },
    })

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (data: any) => slidersApi.update(slider!.id, data),
        onSuccess: () => {
            // Invalidate all table-data queries for this endpoint
            queryClient.invalidateQueries({ queryKey: ["table-data", urlEndpoint] })
            // toast.success("تم تحديث السلايد بنجاح")
            onOpenChange(false)
        },
        onError: (error: any) => {
            toast.error("حدث خطأ أثناء تحديث السلايد", {
                description: error.message,
            })
        },
    })

    const onSubmit = (values: SliderFormValues) => {
        const formattedData: any = {
            title: {
                ar: values.title_ar,
                en: values.title_en,
            },
            description: {
                ar: values.description_ar,
                en: values.description_en,
            },
            target_url: values.target_url,
            start_at: values.start_at.toISOString(),
            end_at: values.end_at.toISOString(),
            active: values.active,
        }

        // Only include image_url if it's a new image or in create mode
        if (mode === "create") {
            // In create mode, always include image_url
            formattedData.image_url = values.image_url
            console.info("📝 Creating slider with image:", values.image_url)
        } else {
            // In update mode, only send image_url if it's different from the original
            // and not empty (to avoid sending empty strings)
            if (values.image_url && values.image_url !== slider?.image_url) {
                formattedData.image_url = values.image_url
                console.info("🔄 Updating slider with new image:", values.image_url)
            } else {
                console.info("⏭️ Skipping image update - no changes detected")
            }
        }

        if (mode === "create") {
            createMutation.mutate(formattedData)
        } else {
            updateMutation.mutate(formattedData)
        }
    }

    const isLoading = createMutation.isPending || updateMutation.isPending

    React.useEffect(() => {
        if (slider && mode === "update") {
            form.reset({
                title_ar: slider.title.ar,
                title_en: slider.title.en,
                description_ar: slider.description.ar,
                description_en: slider.description.en,
                image_url: slider.image_url || "",
                target_url: slider.target_url,
                start_at: new Date(slider.start_at),
                end_at: new Date(slider.end_at),
                active: slider.active,
            })
        } else if (mode === "create") {
            // Reset form for create mode
            form.reset({
                title_ar: "",
                title_en: "",
                description_ar: "",
                description_en: "",
                image_url: "",
                target_url: "",
                start_at: new Date(),
                end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                active: true,
            })
        }
    }, [slider, mode, form])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        {mode === "create" ? "إضافة سلايد جديد" : "تعديل السلايد"}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === "create" 
                            ? "قم بإضافة سلايد جديد للعرض في الصفحة الرئيسية"
                            : "قم بتعديل بيانات السلايد"}
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
                                    name="title_ar"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>العنوان بالعربية</FormLabel>
                                            <FormControl>
                                                <Input placeholder="أدخل عنوان السلايد" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description_ar"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>الوصف بالعربية</FormLabel>
                                            <FormControl>
                                                <Textarea 
                                                    placeholder="أدخل وصف السلايد" 
                                                    className="min-h-[100px]"
                                                    {...field} 
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>

                            <TabsContent value="en" className="space-y-4 mt-4">
                                <FormField
                                    control={form.control}
                                    name="title_en"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title in English</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter slide title" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description_en"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description in English</FormLabel>
                                            <FormControl>
                                                <Textarea 
                                                    placeholder="Enter slide description" 
                                                    className="min-h-[100px]"
                                                    {...field} 
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>
                        </Tabs>

                        <FormField
                            control={form.control}
                            name="image_url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <ImageIcon className="h-4 w-4" />
                                        صورة السلايد
                                    </FormLabel>
                                    <FormControl>
                                        <ImageUpload
                                            value={field.value}
                                            onChange={field.onChange}
                                            folder="sliders"
                                            aspectRatio="landscape"
                                            maxSize={5}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormDescription>قم برفع صورة السلايد (حد أقصى 5MB)</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="target_url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <Link2 className="h-4 w-4" />
                                        الرابط المستهدف
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://example.com" {...field} />
                                    </FormControl>
                                    <FormDescription>الرابط عند النقر على السلايد</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="start_at"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>تاريخ البداية</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "pl-3 text-right font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP", { locale: ar })
                                                        ) : (
                                                            <span>اختر التاريخ</span>
                                                        )}
                                                        <Calendar className="mr-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <CalendarComponent
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date < new Date(new Date().setHours(0, 0, 0, 0))
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="end_at"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>تاريخ النهاية</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "pl-3 text-right font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP", { locale: ar })
                                                        ) : (
                                                            <span>اختر التاريخ</span>
                                                        )}
                                                        <Calendar className="mr-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <CalendarComponent
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date < new Date(new Date().setHours(0, 0, 0, 0))
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="active"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">تفعيل السلايد</FormLabel>
                                        <FormDescription>
                                            عند التفعيل، سيتم عرض السلايد في الفترة المحددة
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

