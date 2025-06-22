'use client'


import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, type ChartConfig } from "@/components/ui/chart"
import { useRentAnalysis } from "@/hooks/property/usePropertyEvents"
import toast from "react-hot-toast"
import { Bar, BarChart, TooltipProps, XAxis } from "recharts"
import { useAccount } from "wagmi"
import EmptyContent from "../shared/empty-content"
import { ValueType } from "tailwindcss/types/config"
import { NameType } from "recharts/types/component/DefaultTooltipContent"

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
    
    console.log(data)

    return (  
        
        <>

            { allZeros ? 
                <EmptyContent
                    className=""
                    emptyText="You don't have any rental properties for 2025"
                /> :
                
                <ChartContainer config={chartConfig} className="h-[400px] w-full">
                    <BarChart accessibilityLayer data={chartData}>

                        <XAxis
                            dataKey="monthName"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />

                        <ChartTooltip content={(props) => <ChartTooltipContent {...(props as any)} />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar dataKey="collected" fill="var(--color-collected)" name={"Collected"} radius={4} />
                        <Bar dataKey="expected" fill="var(--color-expected)" name={"Expected"} radius={4} />
                    </BarChart>
                </ChartContainer>
            }
        </>
    )
  }

  type TooltipEntry = {
    dataKey?: string;
    name?: string;
    value?: number;
  };
  
  interface CustomTooltipProps {
    payload?: TooltipEntry[];
    label?: string;
  }
  
  export function ChartTooltipContent({ payload, label }: CustomTooltipProps) {
    if (!payload?.length) return null;
  
    const getLabelColor = (name: string | undefined) => {
      switch (name) {
        case 'collected':
          return 'var(--color-collected)';
        case 'expected':
          return 'var(--color-expected)';
        default:
          return '#999';
      }
    };
  
    return (
      <div className="bg-white shadow rounded p-2 text-sm">
        <p className="font-medium mb-1">{label}</p>
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getLabelColor(entry.dataKey) }}
            />
            <span>
              {entry.name ?? entry.dataKey}: {Number(entry.value ?? 0).toFixed(6)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  