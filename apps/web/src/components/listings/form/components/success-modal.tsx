"use client"

import { useRouter } from "next/navigation"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

interface SuccessModalProps {
    open: boolean
    onClose: () => void
    onCreateAnother: () => void
    isEditing?: boolean
}

export function SuccessModal({
    open,
    onClose,
    onCreateAnother,
    isEditing = false
}: SuccessModalProps) {
    const router = useRouter()

    const handleClose = () => {
        onClose()
        router.push("/")
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <div className="flex flex-col items-center justify-center text-center space-y-6 py-8">
                    {/* Success Icon */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
                        <CheckCircle2 className="h-24 w-24 text-primary relative" strokeWidth={1.5} />
                    </div>

                    {/* Success Message */}
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold">
                            {isEditing ? "تم تحديث الإعلان بنجاح" : "تم إرسال طلبك بنجاح"}
                        </h2>
                        <p className="text-sm text-muted-foreground leading-relaxed px-4">
                            {isEditing
                                ? "تم تحديث الإعلان بنجاح. يمكنك الآن رؤية التعديلات في قائمة إعلاناتك."
                                : "تم إرسال طلبك بنجاح، وسيقوم فريقنا بمراجعته والتأكد من مطابقته للمعايير. ستتلقى إشعاراً فور اعتماد الطلب ليظهر ضمن الإعلانات المتاحة للمستخدمين."
                            }
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 w-full">
                        {!isEditing && (
                            <Button onClick={onCreateAnother} className="w-full h-12 text-base font-bold rounded-xl">
                                إرسال إعلان آخر
                            </Button>
                        )}
                        <Button
                            onClick={handleClose}
                            variant="outline"
                            className="w-full h-12 text-base font-bold rounded-xl bg-transparent"
                        >
                            {isEditing ? "العودة للإعلانات" : "إغلاق"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
