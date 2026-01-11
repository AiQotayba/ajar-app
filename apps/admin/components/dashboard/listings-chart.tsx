// components/dashboard/listings-chart.tsx
import { TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area
} from "recharts"

interface ListingsChartProps {
  data?: Array<{ month: string; count: number }>
}

export function ListingsChart({ data = [] }: ListingsChartProps) {
  const chartData = data.map(item => ({
    ...item,
    count: item.count || 0
  }))

  // تدرج اللون الأخضر
  const gradientId = "greenGradient"

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
      {/* تأثير خلفية متحركة */}
      {/* <div className="absolute inset-0 bg-gradient-to-br from-green-50/20 to-emerald-50/10 dark:from-green-950/10 dark:to-emerald-950/5 group-hover:scale-105 transition-transform duration-500" /> */}

      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              تطور الإعلانات
            </CardTitle>
            <CardDescription className="text-primary/70 dark:text-primary/70">
              نمو الإعلانات الشهري باللون الأخضر
            </CardDescription>
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
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
                  border: '1px solid hsl(142, 72%, 45%, 0.2)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(16, 185, 129, 0.1)'
                }}
                labelStyle={{ color: '#059669', fontWeight: 600 }}
                formatter={(value) => [`${value} إعلان`, 'العدد']}
              />

              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                iconSize={8}
              />

              {/* المنطقة المظللة تحت الخط */}
              <Area
                type="monotone"
                dataKey="count"
                stroke="transparent"
                fill={`url(#${gradientId})`}
                fillOpacity={1}
              />

              {/* الخط الرئيسي */}
              <Line
                type="monotone"
                dataKey="count"
                stroke="#10B981"
                strokeWidth={4}
                strokeLinecap="round"
                dot={{
                  stroke: '#059669',
                  strokeWidth: 2,
                  r: 4,
                  fill: '#ffffff',
                  strokeDasharray: '0 0'
                }}
                activeDot={{
                  r: 8,
                  fill: '#059669',
                  stroke: '#ffffff',
                  strokeWidth: 2,
                  filter: 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.5))'
                }}
                name="عدد الإعلانات"
              />

              {/* خط إضافي للتأثير */}
              {/* <Line
                type="monotone"
                dataKey="count"
                stroke="url(#greenGradient2)"
                strokeWidth={6}
                strokeOpacity={0.1}
                strokeLinecap="round"
                dot={false}
                activeDot={false}
                name=" "
              /> */}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* إحصائيات سريعة تحت المخطط */}
        <div className="mt-6 pt-4 border-t border-green-100 dark:border-green-900/30">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-green-50/50 dark:bg-green-900/10 hover:scale-105 transition-transform duration-200">
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                {chartData.reduce((sum, item) => sum + item.count, 0)}
              </div>
              <div className="text-sm text-green-600/70 dark:text-green-400/70 mt-1">
                إجمالي الإعلانات
              </div>
            </div>

            <div className="text-center p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/10 hover:scale-105 transition-transform duration-200">
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                {chartData.length > 0 ?
                  Math.max(...chartData.map(item => item.count)) : 0}
              </div>
              <div className="text-sm text-emerald-600/70 dark:text-emerald-400/70 mt-1">
                أعلى قيمة
              </div>
            </div>

          </div>
        </div>
      </CardContent>

      {/* تعريف التدرج الثاني */}
      <svg style={{ height: 0 }}>
        <defs>
          <linearGradient id="greenGradient2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#34D399" stopOpacity="0.8" />
          </linearGradient>
        </defs>
      </svg>
    </Card>
  )
}