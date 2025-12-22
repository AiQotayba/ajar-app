"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Calendar, Image as ImageIcon, Link2 } from "lucide-react"
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
import { ImageUpload } from "@/components/ui/image-upload"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import type { Slider } from "@/lib/types/slider"
import { ApiResponse } from "@/lib/api-client"

// Form validation schema
const sliderFormSchema = z.object({
    title_ar: z.string().min(3, "العنوان بالعربية يجب أن يكون 3 أحرف على الأقل"),
    title_en: z.string().min(3, "العنوان بالإنجليزية يجب أن يكون 3 أحرف على الأقل"),
    description_ar: z.string().optional().or(z.literal("")),
    description_en: z.string().optional().or(z.literal("")),
    image_url: z.string().min(1, "يجب رفع صورة السلايد"), // Can be image_name (path) or full URL
    target_url: z.union([
        z.string().url("يجب إدخال رابط صحيح"),
        z.literal("")
    ]).optional(),
    start_at: z.date({
        required_error: "يجب تحديد تاريخ البداية",
    }),
    end_at: z.date({
        required_error: "يجب تحديد تاريخ النهاية",
    }),
    active: z.boolean().default(true),
})
    .refine((data) => data.end_at > data.start_at, {
        message: "تاريخ النهاية يجب أن يكون بعد تاريخ البداية",
        path: ["end_at"],
    })

type SliderFormValues = z.infer<typeof sliderFormSchema>

type SliderPayload = {
    title: {
        ar: string
        en: string
    }
    description: {
        ar: string
        en: string
    }
    image_url?: string
    target_url?: string
    start_at: string
    end_at: string
    active: boolean
}

interface SliderFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    urlEndpoint: string
    slider?: Slider | null
    mode: "create" | "update"
}

export function SliderForm({ open, onOpenChange, urlEndpoint, slider, mode }: SliderFormProps) {
    const queryClient = useQueryClient()

    // Helper function to get default start date (at least 1 minute from now)
    const getDefaultStartDate = () => new Date(new Date().getTime() + 60 * 1000) // Add 1 minute   

    const form = useForm<SliderFormValues>({
        resolver: zodResolver(sliderFormSchema),
        defaultValues: {
            title_ar: slider?.title.ar || "",
            title_en: slider?.title.en || "",
            description_ar: slider?.description.ar || "",
            description_en: slider?.description.en || "",
            image_url: slider?.image_url || "",
            target_url: slider?.target_url || "",
            start_at: slider?.start_at ? new Date(slider.start_at) : getDefaultStartDate(),
            end_at: slider?.end_at ? new Date(slider.end_at) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            active: slider?.active ?? true,
        },
    })

    // Create mutation
    const createMutation = useMutation<ApiResponse<Slider>, ApiResponse<Slider>, SliderPayload>({
        mutationFn: (data: SliderPayload) => api.post(`/admin/sliders`, data),
        onSuccess: (response: ApiResponse<Slider>) => {
            toast.success(response?.message || "تم إضافة السلايد بنجاح")
            onOpenChange(false)
            form.reset()
        },
        onError: (error: ApiResponse<Slider>) => {
            toast.error(error?.message || "حدث خطأ أثناء إضافة السلايد")
        },
    })

    // Update mutation
    const updateMutation = useMutation<ApiResponse<Slider>, ApiResponse<Slider>, SliderPayload>({
        mutationFn: (data: SliderPayload) => api.put(`/admin/sliders/${slider!.id}`, data),
        onSuccess: () => {
            // Invalidate all table-data queries for this endpoint
            queryClient.invalidateQueries({ queryKey: ["table-data", urlEndpoint] })
            // toast.success("تم تحديث السلايد بنجاح")
            onOpenChange(false)
        },
        onError: (error: ApiResponse<Slider>) => {
            toast.error("حدث خطأ أثناء تحديث السلايد", {
                description: error.message,
            })
        },
    })

    const onSubmit = (values: SliderFormValues) => {

        // Ensure start_at is at least 5 minutes after now (accounting for timezone/server differences)
        const now = new Date()
        const minStartDate = new Date(now.getTime() + 5 * 60 * 1000) // +5 minutes

        let startAt = values.start_at


        // Check if start_at is less than 5 minutes from now (to account for server timezone differences)
        const timeDiff = startAt.getTime() - now.getTime()
        const minDiff = 5 * 60 * 1000 // 5 minutes in milliseconds

        if (timeDiff < minDiff) {
            startAt = minStartDate
            form.setValue("start_at", startAt)
        }

        const formattedData: SliderPayload = {
            title: {
                ar: values.title_ar,
                en: values.title_en,
            },
            description: {
                ar: values.description_ar || "",
                en: values.description_en || "",
            },
            start_at: startAt.toISOString(),
            end_at: values.end_at.toISOString(),
            active: values.active,
        }

        // Only include target_url if it's provided and not empty
        if (values.target_url && values.target_url.trim() !== "") {
            formattedData.target_url = values.target_url
        }

        console.info("📦 [DEBUG] Formatted data to send:", {
            ...formattedData,
            start_at: formattedData.start_at,
            end_at: formattedData.end_at
        })

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
            console.info("🚀 [DEBUG] Creating slider with data:", formattedData)
            createMutation.mutate(formattedData)
        } else {
            console.info("🔄 [DEBUG] Updating slider with data:", formattedData)
            updateMutation.mutate(formattedData)
        }
    }

    const isLoading = createMutation.isPending || updateMutation.isPending

    React.useEffect(() => {
        console.info("🔄 [DEBUG] useEffect triggered:", { mode, hasSlider: !!slider })

        if (slider && mode === "update") {
            const startAtDate = new Date(slider.start_at)
            const endAtDate = new Date(slider.end_at)

            console.info("📝 [DEBUG] Resetting form for update mode:", {
                sliderStartAt: slider.start_at,
                parsedStartAt: startAtDate.toISOString(),
                sliderEndAt: slider.end_at,
                parsedEndAt: endAtDate.toISOString()
            })

            form.reset({
                title_ar: slider.title.ar,
                title_en: slider.title.en,
                description_ar: slider.description.ar,
                description_en: slider.description.en,
                image_url: slider.image_url || "",
                target_url: slider.target_url,
                start_at: startAtDate,
                end_at: endAtDate,
                active: slider.active,
            })
        } else if (mode === "create") {
            const defaultStart = getDefaultStartDate()
            const defaultEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

            console.info("📝 [DEBUG] Resetting form for create mode:", {
                defaultStart: defaultStart.toISOString(),
                defaultEnd: defaultEnd.toISOString()
            })

            // Reset form for create mode
            form.reset({
                title_ar: "",
                title_en: "",
                description_ar: "",
                description_en: "",
                image_url: "",
                target_url: "",
                start_at: defaultStart,
                end_at: defaultEnd,
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
                            name="description_ar"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>الوصف بالعربية</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="أدخل وصف السلايد (اختياري)"
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>الوصف اختياري</FormDescription>
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
                                            placeholder="Enter slide description (optional)"
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>Description is optional</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
                                            maxSize={25}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormDescription>قم برفع صورة السلايد (حد أقصى 25MB)</FormDescription>
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
                                    <FormDescription>الرابط عند النقر على السلايد (اختياري)</FormDescription>
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
                                                    onSelect={(date) => {
                                                        if (date) {

                                                            // Set time to current time + 1 minute to ensure it's after now
                                                            const now = new Date()
                                                            const selectedDate = new Date(date)

                                                            // If selected date is today, set time to now + 1 minute
                                                            const today = new Date()
                                                            today.setHours(0, 0, 0, 0)
                                                            const selectedDay = new Date(selectedDate)
                                                            selectedDay.setHours(0, 0, 0, 0)

                                                            const isToday = selectedDay.getTime() === today.getTime()

                                                            if (isToday) {
                                                                // Today: set to now + 5 minutes (to account for server timezone differences) 
                                                                const futureTime = new Date(now.getTime() + 5 * 60 * 1000) // +5 minutes
                                                                selectedDate.setHours(futureTime.getHours())
                                                                selectedDate.setMinutes(futureTime.getMinutes())
                                                                selectedDate.setSeconds(futureTime.getSeconds())
                                                                selectedDate.setMilliseconds(futureTime.getMilliseconds())

                                                            } else {
                                                                // Future date: set to start of day (00:00:00)
                                                                selectedDate.setHours(0)
                                                                selectedDate.setMinutes(0)
                                                                selectedDate.setSeconds(0)
                                                                selectedDate.setMilliseconds(0)
                                                            }

                                                            field.onChange(selectedDate)
                                                        } else {
                                                            field.onChange(date)
                                                        }
                                                    }}
                                                    disabled={(date) => {
                                                        const today = new Date()
                                                        today.setHours(0, 0, 0, 0)
                                                        return date < today
                                                    }}
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
                        <div className="space-y-2">

                            {form.formState.errors && Object.keys(form.formState.errors).length > 0 &&
                                Object.values(form.formState.errors).map((error, index) => (
                                    <p key={index} className="text-destructive text-xs">
                                        - {error.message}
                                    </p>
                                ))}
                        </div>
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

