import { Pencil } from "lucide-react"
import Link from "next/link"

export function OfficeCard() {
  return (
    <div className="relative bg-card rounded-3xl border p-4 space-y-3" dir="rtl">
      <div className="flex items-start gap-3">
        <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
          <img src="/images/modern-office-building.png" alt="Office" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 text-right">
          <h3 className="font-bold text-lg">مكتب الأحمد</h3>
          <p className="text-sm text-muted-foreground text-end" dir="ltr">+90 000 000 00 00</p>
        </div>
        <Link href={"/office/edit"} className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
          <Pencil className="h-5 w-5 text-primary-foreground" />
        </Link>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        الوصف هنا إن وجد..الوصف هنا إن وجد..الوصف هنا إن وجد..الوصف هنا إن وجد..الوصف هنا إن وجد.
      </p>
    </div>
  )
}
