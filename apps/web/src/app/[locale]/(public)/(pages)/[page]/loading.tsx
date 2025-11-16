import { Spinner } from '@/components/ui/spinner'

export default function PageLoading() {
  return (
    <div className="min-h-screen bg-background pb-24 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner className="w-8 h-8" />
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    </div>
  )
}

