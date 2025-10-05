"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Notification {
  id: string
  title: string
  content: string
  time: string
  date: string
  isRead: boolean
}

export function NotificationsContent() {
  const [notifications] = useState<Notification[]>([
    {
      id: "1",
      title: "عنوان الإشعار",
      content:
        "تمت مراجعة إعلانك بعناية والتأكد من مطابقته للمعايير. سيتم نشره قريبًا لتطوير نتائج البحث ويتمكن الباحثون عن العقارات من الوصول...",
      time: "10:30",
      date: "today",
      isRead: false,
    },
    {
      id: "2",
      title: "عنوان الإشعار",
      content:
        "تمت مراجعة إعلانك بعناية والتأكد من مطابقته للمعايير. سيتم نشره قريبًا لتطوير نتائج البحث ويتمكن الباحثون عن العقارات من الوصول...",
      time: "10:30",
      date: "today",
      isRead: true,
    },
    {
      id: "3",
      title: "عنوان الإشعار",
      content:
        "تمت مراجعة إعلانك بعناية والتأكد من مطابقته للمعايير. سيتم نشره قريبًا لتطوير نتائج البحث ويتمكن الباحثون عن العقارات من الوصول...",
      time: "10:30",
      date: "yesterday",
      isRead: false,
    },
    {
      id: "4",
      title: "عنوان الإشعار",
      content:
        "تمت مراجعة إعلانك بعناية والتأكد من مطابقته للمعايير. سيتم نشره قريبًا لتطوير نتائج البحث ويتمكن الباحثون عن العقارات من الوصول...",
      time: "10:30",
      date: "10 أكتوبر",
      isRead: false,
    },
  ])

  const groupedNotifications = notifications.reduce(
    (acc, notification) => {
      const dateLabel =
        notification.date === "today" ? "اليوم" : notification.date === "yesterday" ? "أمس" : notification.date
      if (!acc[dateLabel]) {
        acc[dateLabel] = []
      }
      acc[dateLabel].push(notification)
      return acc
    },
    {} as Record<string, Notification[]>,
  )

  if (notifications.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b">
          <Link href="/">
            <Button variant="outline" size="icon" className="rounded-2xl bg-transparent">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">الإشعارات</h1>
          <div className="w-10" />
        </header>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
          <div className="relative w-80 h-80 mb-8">
            <div className="absolute inset-0 bg-muted/30 rounded-[4rem]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <Bell className="h-32 w-32 text-primary" strokeWidth={1.5} />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">!</span>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-20 left-12 text-muted-foreground/30 text-2xl">▲</div>
            <div className="absolute top-32 right-16 text-muted-foreground/30 text-xl">▶</div>
            <div className="absolute bottom-24 left-20 text-muted-foreground/30 text-lg">◀</div>
            <div className="absolute bottom-32 right-12 text-muted-foreground/30">▼</div>
            <div className="absolute top-40 left-24 text-muted-foreground/30 text-sm">◆</div>
            <div className="absolute bottom-40 right-20 text-muted-foreground/30 text-xs">●</div>
          </div>
          <h2 className="text-2xl font-bold text-center">لا يوجد إشعارات!</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b">
        <Link href="/">
          <Button variant="outline" size="icon" className="rounded-2xl bg-transparent">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold">الإشعارات</h1>
        <div className="w-10" />
      </header>

      <div className="p-6 space-y-6">
        {Object.entries(groupedNotifications).map(([dateLabel, items]) => (
          <div key={dateLabel} className="space-y-3">
            <h2 className="text-right font-semibold text-lg">{dateLabel}</h2>
            {items.map((notification) => (
              <div
                key={notification.id}
                className={`relative p-4 rounded-2xl border ${
                  notification.isRead ? "bg-card" : "bg-card border-primary/30"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-sm text-muted-foreground">{notification.time}</span>
                  <h3 className="font-bold text-lg">{notification.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{notification.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    <div className={`w-2 h-2 rounded-full ${notification.isRead ? "bg-muted" : "bg-primary"}`} />
                    <div className={`w-2 h-2 rounded-full ${notification.isRead ? "bg-muted" : "bg-primary"}`} />
                  </div>
                  <button className="text-primary font-medium text-sm">فتح</button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
