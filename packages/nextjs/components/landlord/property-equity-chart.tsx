"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useEquityDistribution } from "@/hooks/property/usePropertyEvents"
import { usePathname } from "next/navigation"

export const description = "A linear line chart"

const chartData = [
  { month: "January", equity: 25 },
  { month: "February", equity: 5 },
  { month: "March", equity: 20 },
  { month: "April", equity: 20 },
  { month: "May", equity: 35 },
  { month: "June", equity: 10 },
]

const chartConfig = {
  equity: {
    label: "Equity(%)",
    color: "#3b82f6",
  },
} satisfies ChartConfig

export function PropertyEquityChart() {
  const path = usePathname()
  
  const propertyId = path.split("/")[3]
  const {data: data, loading:equityLoading} = useEquityDistribution(+propertyId, 12)
  return (
        <ChartContainer config={chartConfig} className="h-[300px] w-full p-4">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="equity"
              type="linear"
              stroke="var(--color-equity)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
  )
}
