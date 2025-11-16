import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background pb-24 flex items-center justify-center" dir="rtl">
            <div className="container max-w-4xl mx-auto px-4 py-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex flex-col gap-4">
                        <div>
                            <p className="font-semibold mb-2">الصفحة غير موجودة</p>
                            <p className="text-sm text-muted-foreground">
                                Page not found
                            </p>
                        </div>
                        <Link href="/">
                            <Button variant="outline" size="sm">
                                العودة للصفحة الرئيسية / Return to Home
                            </Button>
                        </Link>
                    </AlertDescription>
                </Alert>
            </div>
        </div>
    )
}

