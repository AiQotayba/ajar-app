"use client"

import { Building2, Users, Star, MessageSquare, LayoutDashboard } from "lucide-react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { ListingsChart } from "@/components/dashboard/listings-chart"
import { UsersChart } from "@/components/dashboard/users-chart"
import { PageHeader } from "@/components/dashboard/page-header"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api-client"
import { useQuery } from "@tanstack/react-query"

export default function DashboardPage() {
  const { data } = useQuery({
    queryKey: ["dashboardData"],
    queryFn: () => api.get("/admin/dashboard/analytics").then(res => res.data),
  })
  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-6">
      {/* Page Header */}
      <PageHeader
        title="لوحة التحكم"
        description="مرحباً بك في لوحة تحكم أجار"
        icon={LayoutDashboard}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="الإعلانات المنشورة" value="245" icon={Building2} trend={{ value: 12, isPositive: true }} />
        <StatsCard title="قيد المراجعة" value="18" icon={MessageSquare} trend={{ value: 5, isPositive: false }} />
        <StatsCard title="المستخدمين الجدد" value="1,248" icon={Users} trend={{ value: 8, isPositive: true }} />
        <StatsCard title="متوسط التقييم" value="4.8" icon={Star} trend={{ value: 3, isPositive: true }} />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        <ListingsChart />
        <UsersChart />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/50 bg-card p-4 md:p-6 shadow-md hover:shadow-lg transition-all duration-300">
          <h3 className="mb-4 md:mb-6 text-lg md:text-xl font-semibold">آخر الإعلانات</h3>
          <div className="space-y-3">
            {[
              { title: "فيلا فاخرة للبيع في عمان", time: "منذ ساعة", status: "قيد المراجعة" },
              { title: "شقة مفروشة في الدوار الرابع", time: "منذ ساعتين", status: "منشور" },
              { title: "أرض سكنية في الجبيهة", time: "منذ 3 ساعات", status: "قيد المراجعة" },
              { title: "محل تجاري في وسط البلد", time: "منذ 5 ساعات", status: "منشور" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-xl bg-muted/30 p-4 transition-all hover:bg-muted/50 hover:shadow-md"
              >
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>
                </div>
                <Badge variant={item.status === "منشور" ? "default" : "secondary"} className="shrink-0 rounded-full">
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card p-4 md:p-6 shadow-md hover:shadow-lg transition-all duration-300">
          <h3 className="mb-4 md:mb-6 text-lg md:text-xl font-semibold">آخر المستخدمين</h3>
          <div className="space-y-3">
            {[
              { name: "أحمد محمد علي", time: "انضم منذ يوم", status: "نشط" },
              { name: "فاطمة حسن", time: "انضم منذ يومين", status: "نشط" },
              { name: "محمود خالد", time: "انضم منذ 3 أيام", status: "نشط" },
              { name: "سارة عبدالله", time: "انضم منذ 4 أيام", status: "غير نشط" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-xl bg-muted/30 p-4 transition-all hover:bg-muted/50 hover:shadow-md"
              >
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/60 shadow-md" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>
                </div>
                <Badge variant={item.status === "نشط" ? "default" : "secondary"} className="shrink-0 rounded-full">
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
