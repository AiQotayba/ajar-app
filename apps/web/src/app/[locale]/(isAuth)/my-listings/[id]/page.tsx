"use client"
import { ListingForm } from "@/components/listings/form/listing-form"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  
  const { 
    data: listingData, 
    isLoading, 
    error,
    isError 
  } = useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      const response = await api.get(`/user/listings/${id}`)
      if (response.isError) {
        throw new Error(response.message || "فشل في تحميل بيانات الإعلان")
      }
      return response.data
    },
    enabled: !!id,
  })

  const handleCancel = () => {
    router.back()
  }

  if (!id) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">
            خطأ في تحميل الإعلان
          </h1>
          <p className="text-muted-foreground mb-6">
            لم يتم العثور على معرف الإعلان
          </p>
          <Button onClick={handleCancel} variant="outline">
            العودة للخلف
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">جاري تحميل الإعلان...</h1>
          <p className="text-muted-foreground">
            يرجى الانتظار بينما نقوم بتحميل بيانات الإعلان
          </p>
        </div>
      </div>
    )
  }

  if (isError || !listingData) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">
            خطأ في تحميل الإعلان
          </h1>
          <p className="text-muted-foreground mb-6">
            {error?.message || "لم يتم العثور على الإعلان أو حدث خطأ أثناء تحميله"}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleCancel} variant="outline">
              العودة للخلف
            </Button>
            <Button onClick={() => window.location.reload()}>
              إعادة المحاولة
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ListingForm
      isEditing={true}
      initialData={listingData}
      listingId={id}
      onCancel={handleCancel}
    />
  )
}
