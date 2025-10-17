"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Building2, Calendar, Languages, MapPin, DollarSign, Sparkles, Image as ImageIcon, X } from "lucide-react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ImageUpload } from "@/components/ui/image-upload"
import { cn } from "@/lib/utils"
import { listingsApi } from "@/lib/api/listings"
import type { Listing } from "@/lib/types/listing"

// Form validation schema
const listingFormSchema = z.object({
    owner_id: z.number().optional(),
    category_id: z.number().min(1, "الفئة مطلوبة"),
    title_ar: z.string().min(3, "العنوان بالعربية يجب أن يكون 3 أحرف على الأقل"),
    title_en: z.string().min(3, "العنوان بالإنجليزية يجب أن يكون 3 أحرف على الأقل"),
    description_ar: z.string().optional(),
    description_en: z.string().optional(),
    price: z.number().min(0, "السعر يجب أن يكون أكبر من أو يساوي صفر"),
    currency: z.string().default("IQD"),
    governorate_id: z.number().min(1, "المحافظة مطلوبة"),
    city_id: z.number().optional(),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
    type: z.enum(["rent", "sale"]),
    pay_every: z.number().optional(),
    insurance: z.number().optional(),
    available_from: z.date().optional(),
    available_until: z.date().optional(),
    status: z.enum(["draft", "in_review", "approved", "rejected"]).default("draft"),
    availability_status: z.enum(["available", "unavailable", "rented", "solded"]).default("available"),
    is_featured: z.boolean().default(false),
    ribon_text_ar: z.string().optional(),
    ribon_text_en: z.string().optional(),
    ribon_color: z.string().optional(),
})

type ListingFormValues = z.infer<typeof listingFormSchema>

interface ListingFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    urlEndpoint: string
    listing?: Listing | null
    mode: "create" | "update"
}

export function ListingForm({ open, onOpenChange, urlEndpoint, listing, mode }: ListingFormProps) {
    const queryClient = useQueryClient()
    
    // Media state (up to 5 images)
    const [mediaUrls, setMediaUrls] = React.useState<string[]>([])
    
    // Properties state (e.g., [{ property_id: 1, value: "4", sort_order: 1 }])
    // TODO: Implement dynamic properties form based on category
    const [properties, setProperties] = React.useState<Array<{ property_id: number; value: string; sort_order: number }>>([])
    
    // Features state (e.g., [1, 2, 3] - feature IDs)
    // TODO: Implement multi-select for features
    const [features, setFeatures] = React.useState<number[]>([])

    const form = useForm<ListingFormValues>({
        resolver: zodResolver(listingFormSchema),
        defaultValues: {
            owner_id: undefined,
            category_id: 0,
            title_ar: "",
            title_en: "",
            description_ar: "",
            description_en: "",
            price: 0,
            currency: "IQD",
            governorate_id: 0,
            city_id: undefined,
            latitude: "",
            longitude: "",
            type: "rent",
            pay_every: undefined,
            insurance: undefined,
            available_from: undefined,
            available_until: undefined,
            status: "draft",
            availability_status: "available",
            is_featured: false,
            ribon_text_ar: "",
            ribon_text_en: "",
            ribon_color: "#3b82f6",
        },
    })

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: any) => listingsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["table-data", urlEndpoint] })
            onOpenChange(false)
            form.reset()
        },
        onError: (error: any) => {
            console.error("حدث خطأ أثناء إضافة الإعلان:", error)
        },
    })

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (data: any) => listingsApi.update(listing!.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["table-data", urlEndpoint] })
            onOpenChange(false)
        },
        onError: (error: any) => {
            console.error("حدث خطأ أثناء تحديث الإعلان:", error)
        },
    })

    const onSubmit = (values: ListingFormValues) => {
        // Build media array from uploaded images
        const media = mediaUrls.map((url, index) => ({
            type: "image" as const,
            url,
            source: "file",
            sort_order: index + 1,
        }))

        const formattedData = {
            owner_id: values.owner_id,
            category_id: values.category_id,
            title: {
                ar: values.title_ar,
                en: values.title_en,
            },
            description: {
                ar: values.description_ar || "",
                en: values.description_en || "",
            },
            price: values.price,
            currency: values.currency,
            governorate_id: values.governorate_id,
            city_id: values.city_id,
            latitude: values.latitude,
            longitude: values.longitude,
            type: values.type,
            pay_every: values.pay_every,
            insurance: values.insurance,
            available_from: values.available_from?.toISOString(),
            available_until: values.available_until?.toISOString(),
            status: values.status,
            availability_status: values.availability_status,
            is_featured: values.is_featured,
            ribon_text: {
                ar: values.ribon_text_ar || null,
                en: values.ribon_text_en || null,
            },
            ribon_color: values.ribon_color,
            properties,
            features,
            media,
        }

        if (mode === "create") {
            createMutation.mutate(formattedData)
        } else {
            updateMutation.mutate(formattedData)
        }
    }

    const isLoading = createMutation.isPending || updateMutation.isPending
    const selectedType = form.watch("type")

    React.useEffect(() => {
        if (listing && mode === "update") {
            setMediaUrls(listing.media?.map(m => m.url) || [])
            setProperties([]) // TODO: Load from listing when available
            setFeatures([]) // TODO: Load from listing when available
            
            form.reset({
                owner_id: listing.owner_id || undefined,
                category_id: listing.category_id,
                title_ar: listing.title?.ar || "",
                title_en: listing.title?.en || "",
                description_ar: listing.description?.ar || "",
                description_en: listing.description?.en || "",
                price: listing.price,
                currency: listing.currency,
                governorate_id: listing.governorate_id,
                city_id: listing.city_id || undefined,
                latitude: listing.latitude || "",
                longitude: listing.longitude || "",
                type: listing.type,
                pay_every: listing.pay_every || undefined,
                insurance: listing.insurance || undefined,
                available_from: listing.available_from ? new Date(listing.available_from) : undefined,
                available_until: listing.available_until ? new Date(listing.available_until) : undefined,
                status: listing.status,
                availability_status: listing.availability_status,
                is_featured: listing.is_featured,
                ribon_text_ar: listing.ribon_text?.ar || "",
                ribon_text_en: listing.ribon_text?.en || "",
                ribon_color: listing.ribon_color,
            })
        } else if (mode === "create") {
            setMediaUrls([])
            setProperties([])
            setFeatures([])
        }
    }, [listing, mode, form])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        {mode === "create" ? "إضافة إعلان جديد" : "تعديل الإعلان"}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === "create" 
                            ? "قم بإضافة إعلان جديد للنظام"
                            : "قم بتعديل بيانات الإعلان"}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Title Tabs */}
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
                                                <Input placeholder="أدخل عنوان الإعلان" {...field} />
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
                                                    placeholder="أدخل وصف الإعلان" 
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
                                                <Input placeholder="Enter listing title" {...field} />
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
                                                    placeholder="Enter listing description" 
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

                        {/* Price & Type */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4" />
                                            السعر
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="currency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>العملة</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="اختر العملة" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="IQD">IQD - دينار عراقي</SelectItem>
                                                <SelectItem value="USD">USD - دولار</SelectItem>
                                                <SelectItem value="EUR">EUR - يورو</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>نوع الإعلان</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="اختر النوع" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="rent">🏠 إيجار</SelectItem>
                                                <SelectItem value="sale">💰 بيع</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Rent-specific fields */}
                        {selectedType === "rent" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50 border">
                                <FormField
                                    control={form.control}
                                    name="pay_every"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>الدفع كل (أيام)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="30"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                                    value={field.value || ""}
                                                />
                                            </FormControl>
                                            <FormDescription>عدد الأيام بين كل دفعة</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="insurance"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>مبلغ التأمين</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                                    value={field.value || ""}
                                                />
                                            </FormControl>
                                            <FormDescription>مبلغ التأمين المطلوب</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {/* Availability Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="available_from"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>متاح من</FormLabel>
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
                                name="available_until"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>متاح حتى</FormLabel>
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
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Status & Availability Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>حالة الموافقة</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="draft">مسودة</SelectItem>
                                                <SelectItem value="in_review">قيد المراجعة</SelectItem>
                                                <SelectItem value="approved">معتمد</SelectItem>
                                                <SelectItem value="rejected">مرفوض</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="availability_status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>حالة التوفر</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="available">متاح</SelectItem>
                                                <SelectItem value="unavailable">غير متاح</SelectItem>
                                                <SelectItem value="rented">مؤجر</SelectItem>
                                                <SelectItem value="solded">مباع</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Category & Location */}
                        {/* TODO: Fetch categories, governorates, and cities from API */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="category_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>الفئة</FormLabel>
                                        <Select 
                                            onValueChange={(value) => field.onChange(parseInt(value))} 
                                            value={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="اختر الفئة" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {/* TODO: Replace with dynamic categories from API */}
                                                <SelectItem value="1">شقة</SelectItem>
                                                <SelectItem value="2">فيلا</SelectItem>
                                                <SelectItem value="3">أرض</SelectItem>
                                                <SelectItem value="4">محل</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="governorate_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            المحافظة
                                        </FormLabel>
                                        <Select 
                                            onValueChange={(value) => field.onChange(parseInt(value))} 
                                            value={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="اختر المحافظة" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {/* TODO: Replace with dynamic governorates from API */}
                                                <SelectItem value="1">بغداد</SelectItem>
                                                <SelectItem value="2">البصرة</SelectItem>
                                                <SelectItem value="3">أربيل</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="city_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>المدينة</FormLabel>
                                        <Select 
                                            onValueChange={(value) => field.onChange(parseInt(value))} 
                                            value={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="اختر المدينة" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {/* TODO: Replace with dynamic cities based on selected governorate */}
                                                <SelectItem value="1">الكرخ</SelectItem>
                                                <SelectItem value="2">الرصافة</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Coordinates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="latitude"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>خط العرض (Latitude)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="31.9454" {...field} />
                                        </FormControl>
                                        <FormDescription>إحداثيات GPS</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="longitude"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>خط الطول (Longitude)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="35.9284" {...field} />
                                        </FormControl>
                                        <FormDescription>إحداثيات GPS</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Media Upload */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium flex items-center gap-2">
                                    <ImageIcon className="h-4 w-4" />
                                    صور الإعلان (حد أقصى 5 صور)
                                </h3>
                                <span className="text-xs text-muted-foreground">
                                    {mediaUrls.length}/5
                                </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {mediaUrls.map((url, index) => (
                                    <div key={index} className="relative group">
                                        <ImageUpload
                                            value={url}
                                            onChange={(newUrl) => {
                                                const updated = [...mediaUrls]
                                                updated[index] = newUrl
                                                setMediaUrls(updated)
                                            }}
                                            folder="listings"
                                            aspectRatio="square"
                                            maxSize={5}
                                            disabled={isLoading}
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => {
                                                setMediaUrls(mediaUrls.filter((_, i) => i !== index))
                                            }}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}

                                {mediaUrls.length < 5 && (
                                    <div className="relative">
                                        <ImageUpload
                                            value=""
                                            onChange={(url) => {
                                                if (url) {
                                                    setMediaUrls([...mediaUrls, url])
                                                }
                                            }}
                                            folder="listings"
                                            aspectRatio="square"
                                            maxSize={5}
                                            disabled={isLoading}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Featured */}
                        <FormField
                            control={form.control}
                            name="is_featured"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base flex items-center gap-2">
                                            <Sparkles className="h-4 w-4 text-amber-500" />
                                            إعلان مميز
                                        </FormLabel>
                                        <FormDescription>
                                            الإعلانات المميزة تظهر في أعلى القوائم ولها شارة خاصة
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

