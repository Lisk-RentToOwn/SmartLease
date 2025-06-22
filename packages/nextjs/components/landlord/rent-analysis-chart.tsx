'use client'


import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { useRentAnalysis } from "@/hooks/property/usePropertyEvents"
import toast from "react-hot-toast"
import { Bar, BarChart, XAxis } from "recharts"
import { useAccount } from "wagmi"
import EmptyContent from "../shared/empty-content"

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
    const {address} = useAccount()
    const { data, loading } = useRentAnalysis(address, 2025);

    if (!address) {
        toast.error("Please connect your wallet to view rent analysis")
        return <></>
    }


    const chartData = data
    const allZeros = data.every(item => 
        item.collected === 0 && item.expected === 0
    );  

    return (  
        
        <>

            { allZeros ? 
                <EmptyContent
                    className=""
                    emptyText="You don't have any rental properties for 2025"
                /> :
                
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
            }
        </>
    )
  }
