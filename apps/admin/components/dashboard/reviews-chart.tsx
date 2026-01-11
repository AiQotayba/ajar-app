// components/dashboard/reviews-chart.tsx
import { Star } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Line,
    Area,
    AreaChart
} from "recharts"

interface ReviewsChartProps {
    data?: Array<{ month: string; count: number }>
    reviewsData?: any // بيانات التقييمات الخام
}

export function ReviewsChart({ data = [], reviewsData = [] }: ReviewsChartProps) {
    // تحضير بيانات المخطط
    const chartData = data.map(item => ({
        ...item,
        count: item.count || 0
    }))

    // توزيع درجات التقييم (1-5 نجوم)
    const ratingDistribution = [
        { rating: 5, count: reviewsData.filter((r: any) => r.rating === 5).length, color: '#10B981' },
        { rating: 4, count: reviewsData.filter((r: any) => r.rating === 4).length, color: '#34D399' },
        { rating: 3, count: reviewsData.filter((r: any) => r.rating === 3).length, color: '#FBBF24' },
        { rating: 2, count: reviewsData.filter((r: any) => r.rating === 2).length, color: '#F97316' },
        { rating: 1, count: reviewsData.filter((r: any) => r.rating === 1).length, color: '#EF4444' },
    ]

    // إحصائيات سريعة
    const totalReviews = chartData.reduce((sum, item) => sum + item.count, 0)
    const positiveReviews = ratingDistribution.filter(r => r.rating >= 4).reduce((sum, item) => sum + item.count, 0)

    return (
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
            {/* خلفية متدرجة */}
            {/* <div className="absolute inset-0 bg-gradient-to-br from-amber-50/20 to-orange-50/10 dark:from-amber-950/10 dark:to-orange-950/5 group-hover:scale-105 transition-transform duration-500" /> */}

            <CardHeader className="pb-3 relative z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                            تحليلات التقييمات
                        </CardTitle>
                        <CardDescription className="text-amber-600/70 dark:text-amber-400/70">
                            تطور ورضا العملاء عبر التقييمات
                        </CardDescription>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Star className="h-6 w-6 text-white" />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="relative z-10">
                <div className="grid grid-cols-1  gap-6">
                    {/* المخطط الرئيسي - التقييمات الشهرية */}
                    <div className="lg:col-span-2">
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="reviewsGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="hsl(var(--muted-foreground)/0.15)"
                                        vertical={false}
                                    />

                                    <XAxis
                                        dataKey="month"
                                        stroke="hsl(var(--muted-foreground)/0.7)"
                                        fontSize={12}
                                        axisLine={false}
                                        tickLine={false}
                                        tickMargin={10}
                                    />

                                    <YAxis
                                        stroke="hsl(var(--muted-foreground)/0.7)"
                                        fontSize={12}
                                        axisLine={false}
                                        tickLine={false}
                                        tickMargin={10}
                                    />

                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--background))',
                                            border: '1px solid hsl(38, 92%, 50%, 0.2)',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 20px rgba(245, 158, 11, 0.1)'
                                        }}
                                        formatter={(value) => [`${value} تقييم`, 'العدد']}
                                    />

                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#F59E0B"
                                        strokeWidth={3}
                                        fill="url(#reviewsGradient)"
                                        fillOpacity={0.8}
                                        strokeLinecap="round"
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#D97706"
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        dot={false}
                                        activeDot={false}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>

                {/* إحصائيات سريعة */}
                <div className="mt-6 pt-4 border-t border-amber-100 dark:border-amber-900/30">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 rounded-lg bg-amber-50/50 dark:bg-amber-900/10 hover:scale-105 transition-transform duration-200">
                            <div className="text-xl font-bold text-amber-700 dark:text-amber-400">
                                {totalReviews}
                            </div>
                            <div className="text-sm text-amber-600/70 dark:text-amber-400/70 mt-1">
                                إجمالي التقييمات
                            </div>
                        </div>

                        <div className="text-center p-3 rounded-lg bg-orange-50/50 dark:bg-orange-900/10 hover:scale-105 transition-transform duration-200">
                            <div className="text-xl font-bold text-orange-700 dark:text-orange-400">
                                {positiveReviews}
                            </div>
                            <div className="text-sm text-orange-600/70 dark:text-orange-400/70 mt-1">
                                تقييمات إيجابية
                            </div>
                        </div>
                    </div>
                </div>

            </CardContent>
        </Card>
    )
}