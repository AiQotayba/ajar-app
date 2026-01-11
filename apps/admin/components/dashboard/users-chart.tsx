// components/dashboard/users-chart.tsx
import { Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
} from "recharts"

interface UsersChartProps {
  data?: Array<{ month: string; count: number }>
  userData?: any
}

export function UsersChart({ data = [], userData }: UsersChartProps) {
  // تحضير بيانات المخطط
  const chartData = data.map(item => ({
    ...item,
    count: item.count || 0
  }))

  // إحصائيات سريعة
  const totalUsers = chartData.reduce((sum, item) => sum + item.count, 0)
  const maxMonth = chartData.reduce((max, item) => item.count > max.count ? item : max, { month: '', count: 0 })

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
      {/* خلفية متدرجة */}
      {/* <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-indigo-50/10 dark:from-blue-950/10 dark:to-indigo-950/5 group-hover:scale-105 transition-transform duration-500" /> */}

      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              تحليلات المستخدمين
            </CardTitle>
            <CardDescription className="text-blue-600/70 dark:text-blue-400/70">
              تطور ونمو قاعدة المستخدمين
            </CardDescription>
          </div>

          <div className="h-12 w-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Users className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10">
        <div className="grid grid-cols-1 gap-6">
          {/* المخطط الرئيسي - النمو الشهري */}
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
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
                    border: '1px solid hsl(220, 76%, 60%, 0.2)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.1)'
                  }}
                  formatter={(value) => [`${value} مستخدم`, 'العدد']}
                />

                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fill="url(#usersGradient)"
                  fillOpacity={0.8}
                  strokeLinecap="round"
                />

                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#1D4ED8"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  activeDot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* إحصائيات سريعة */}
        <div className="mt-6 pt-4 border-t border-blue-100 dark:border-blue-900/30">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 hover:scale-105 transition-transform duration-200">
              <div className="text-xl font-bold text-blue-700 dark:text-blue-400">
                {totalUsers}
              </div>
              <div className="text-sm text-blue-600/70 dark:text-blue-400/70 mt-1">
                إجمالي المستخدمين
              </div>
            </div>

            <div className="text-center p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/10 hover:scale-105 transition-transform duration-200">
              <div className="text-xl font-bold text-indigo-700 dark:text-indigo-400">
                {maxMonth.count}
              </div>
              <div className="text-sm text-indigo-600/70 dark:text-indigo-400/70 mt-1">
                أعلى شهر ({maxMonth.month})
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}