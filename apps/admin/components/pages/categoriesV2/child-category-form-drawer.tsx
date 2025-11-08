"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Save } from "lucide-react"
import type { Category } from "@/lib/types/category"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ImageUpload } from "@/components/ui/image-upload"
import { api } from "@/lib/api"

const childCategoryFormSchema = z.object({
    name_ar: z.string().min(1, "الاسم بالعربية مطلوب"),
    name_en: z.string().optional(),
    description_ar: z.string().optional(),
    description_en: z.string().optional(),
    icon: z.string().optional(),
    parent_id: z.number(),
})

type ChildCategoryFormValues = z.infer<typeof childCategoryFormSchema>

interface ChildCategoryFormDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    parentId: number
    child?: Category | null
}

export function ChildCategoryFormDrawer({ open, onOpenChange, parentId, child }: ChildCategoryFormDrawerProps) {
    const queryClient = useQueryClient()

    const form = useForm<ChildCategoryFormValues>({
        resolver: zodResolver(childCategoryFormSchema),
        defaultValues: {
            name_ar: child?.name.ar || "",
            name_en: child?.name.en || "",
            description_ar: child?.description?.ar || "",
            description_en: child?.description?.en || "",
            icon: child?.icon || "",
            parent_id: parentId,
        },
    })

    React.useEffect(() => {
        if (child) {
            form.reset({
                name_ar: child.name.ar,
                name_en: child.name.en,
                description_ar: child.description?.ar || "",
                description_en: child.description?.en || "",
                icon: child.icon || "",
                parent_id: parentId,
            })
        } else {
            form.reset({
                name_ar: "",
                name_en: "",
                description_ar: "",
                description_en: "",
                icon: "",
                parent_id: parentId,
            })
        }
    }, [child, parentId, form])

    const createMutation = useMutation({
        mutationFn: (data: ChildCategoryFormValues) => api.post(`/admin/categories`, {
            name: { ar: data.name_ar, en: data.name_en || "" },
            description: { ar: data.description_ar || "", en: data.description_en || "" },
            parent_id: data.parent_id,
            icon: data.icon || null,
            properties_source: "parent_and_custom",
            is_visible: true,
        }),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ["categories"] })
            toast.success(data?.message)
            onOpenChange(false)
            form.reset()
        },
        onError: () => toast.error("فشل إنشاء الفئة الفرعية"),
    })

    const updateMutation = useMutation({
        mutationFn: (data: ChildCategoryFormValues) => api.put(`/admin/categories/${child!.id}`, {
            name: { ar: data.name_ar, en: data.name_en || "" },
            description: { ar: data.description_ar || "", en: data.description_en || "" },
            icon: data.icon || null,
        }),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ["categories"] })
            toast.success(data?.message)
            onOpenChange(false)
            form.reset()
        },
        onError: () => toast.error("فشل تحديث الفئة الفرعية"),
    })

    const onSubmit = (values: ChildCategoryFormValues) => {
        if (child) {
            updateMutation.mutate(values)
        } else {
            createMutation.mutate(values)
        }
    }

    const isLoading = createMutation.isPending || updateMutation.isPending

    return (
        <Drawer open={open} onOpenChange={onOpenChange} direction="left">
            <DrawerContent dir="rtl">
                <DrawerHeader>
                    <DrawerTitle>{child ? "تعديل فئة فرعية" : "إضافة فئة فرعية جديدة"}</DrawerTitle>
                    <DrawerDescription>
                        {child ? "قم بتحديث بيانات الفئة الفرعية" : "أضف فئة فرعية جديدة للفئة الحالية"}
                    </DrawerDescription>
                </DrawerHeader>

                <Form {...form}>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            form.handleSubmit(onSubmit)(e)
                        }}
                        className="px-4 space-y-4 pb-4"
                        noValidate
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name_ar"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>الاسم (عربي) *</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="name_en"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>الاسم (إنجليزي)</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="description_ar"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>الوصف (عربي)</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} />
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
                                        <FormLabel>الوصف (إنجليزي)</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="icon"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>أيقونة الفئة الفرعية</FormLabel>
                                    <FormControl>
                                        <ImageUpload
                                            value={field.value || ""}
                                            onChange={field.onChange}
                                            folder="listings"
                                            aspectRatio="square"
                                            maxSize={2}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DrawerFooter>
                            <Button type="submit" disabled={isLoading} className="w-full">
                                <Save className="w-4 h-4 mr-2" />
                                {isLoading ? "جاري الحفظ..." : child ? "تحديث" : "إضافة"}
                            </Button>
                            <DrawerClose asChild>
                                <Button type="button" variant="outline">
                                    إلغاء
                                </Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </form>
                </Form>
            </DrawerContent>
        </Drawer>
    )
}

