"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Star, MessageSquare } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { reviewsApi } from "@/lib/api/reviews"
import type { Review } from "@/lib/types/review"
import { renderStars } from "./columns"

// Form validation schema
const reviewFormSchema = z.object({
    comment: z.string().optional(),
    is_approved: z.boolean(),
})

type ReviewFormValues = z.infer<typeof reviewFormSchema>

interface ReviewFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    urlEndpoint: string
    review?: Review | null
}

export function ReviewForm({ open, onOpenChange, urlEndpoint, review }: ReviewFormProps) {
    const queryClient = useQueryClient()
    
    const form = useForm<ReviewFormValues>({
        resolver: zodResolver(reviewFormSchema),
        defaultValues: {
            comment: review?.comment || "",
            is_approved: review?.is_approved ?? false,
        },
    })

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (data: any) => reviewsApi.update(review!.id, data),
        onSuccess: () => {
            // Invalidate all table-data queries for this endpoint
            queryClient.invalidateQueries({ queryKey: ["table-data", urlEndpoint] })
            onOpenChange(false)
        },
        onError: (error: any) => {
            console.error("حدث خطأ أثناء تحديث التقييم:", error)
        },
    })

    const onSubmit = (values: ReviewFormValues) => {
        updateMutation.mutate({
            comment: values.comment,
            is_approved: values.is_approved,
        })
    }

    const isLoading = updateMutation.isPending

    React.useEffect(() => {
        if (review) {
            form.reset({
                comment: review.comment,
                is_approved: review.is_approved,
            })
        }
    }, [review, form])

    if (!review) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5" />
                        تعديل التقييم
                    </DialogTitle>
                    <DialogDescription>
                        تعديل حالة التقييم أو التعليق
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Review Info */}
                        <div className="p-4 rounded-lg bg-muted/30 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">المراجع:</span>
                                <span className="text-sm font-semibold">{review.user.full_name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">التقييم:</span>
                                <div className="flex items-center gap-2">
                                    {renderStars(review.rating)}
                                    <span className="text-sm font-bold">{review.rating}/5</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">الإعلان:</span>
                                <span className="text-sm font-semibold truncate max-w-[200px]">
                                    {review.listing.title.ar}
                                </span>
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="comment"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4" />
                                        التعليق
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea 
                                            placeholder="تعليق المستخدم على الإعلان" 
                                            className="min-h-[120px]"
                                            disabled
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        هذا التعليق من المستخدم ولا يمكن تعديله
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="is_approved"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">الموافقة على التقييم</FormLabel>
                                        <FormDescription>
                                            عند الموافقة، سيتم نشر التقييم للمستخدمين
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
                                {isLoading ? "جاري الحفظ..." : "تحديث"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

