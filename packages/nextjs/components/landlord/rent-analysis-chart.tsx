'use client'

const chartData = [
    { month: "January", collected: 186, expected: 80 },
    { month: "February", collected: 305, expected: 200 },
    { month: "March", collected: 237, expected: 120 },
    { month: "April", collected: 73, expected: 190 },
    { month: "May", collected: 209, expected: 130 },
    { month: "June", collected: 214, expected: 140 },
    { month: "July", collected: 214, expected: 140 },
    { month: "August", collected: 214, expected: 140 },
    { month: "Sept", collected: 214, expected: 140 },
    { month: "Oct", collected: 214, expected: 140 },
    { month: "Nov", collected: 214, expected: 140 },
    { month: "Dec", collected: 214, expected: 140 },
  ]

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
  import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "~~/components/ui/chart"

const chartConfig = {
    collected: {
        label: "Collected",
        color: "#2563eb",
    },
    expected: {
        label: "Expected",
        color: "#60a5fa",
    },
} satisfies ChartConfig


export function RentAnalysisChart() {
    return (
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <BarChart accessibilityLayer data={chartData}>
                {/* <CartesianGrid vertical={false} /> */}

                <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                />

                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="collected" fill="var(--color-collected)" radius={4} />
                <Bar dataKey="expected" fill="var(--color-expected)" radius={4} />
            </BarChart>
        </ChartContainer>
    )
  }
