"use client"

import * as React from "react"
import { Pie, PieChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { Device } from "@/types/device"

interface DeviceOSChartProps {
    devices: Device[]
}

// Bảng màu tương phản cao — fallback khi hết CSS vars chart-1..5
const EXTRA_COLORS = [
    'hsl(188, 78%, 41%)',  // Cyan
    'hsl(45, 93%, 47%)',   // Amber
    'hsl(280, 67%, 44%)',  // Purple
    'hsl(346, 77%, 50%)',  // Rose
]

// Tạo key an toàn cho chart config (loại bỏ ký tự đặc biệt)
function toSafeKey(os: string): string {
    return os.toLowerCase().replace(/[^a-z0-9]/g, '_')
}

export function DeviceOSChart({ devices }: DeviceOSChartProps) {
    const { chartData, chartConfig } = React.useMemo(() => {
        const osCounts: Record<string, number> = {}
        devices.forEach(d => {
            const os = d.deviceInfo.os || 'Unknown'
            osCounts[os] = (osCounts[os] || 0) + 1
        })

        const sorted = Object.entries(osCounts)
            .map(([os, count]) => ({ os, count }))
            .sort((a, b) => b.count - a.count)

        // Chart config động — mỗi OS 1 màu
        const config: ChartConfig = {
            devices: { label: "Devices" },
        }
        sorted.forEach(({ os }, i) => {
            const key = toSafeKey(os)
            config[key] = {
                label: os,
                color: i < 5
                    ? `hsl(var(--chart-${i + 1}))`
                    : EXTRA_COLORS[(i - 5) % EXTRA_COLORS.length],
            }
        })

        // Data cho PieChart — fill tham chiếu CSS var
        const data = sorted.map(({ os, count }) => ({
            os: toSafeKey(os),
            devices: count,
            fill: `var(--color-${toSafeKey(os)})`,
        }))

        return { chartData: data, chartConfig: config }
    }, [devices])

    if (chartData.length === 0) {
        return (
            <Card className="h-full flex flex-col">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">OS Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-8">No data</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-0">
                <CardTitle className="text-base font-semibold">OS Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <PieChart>
                        <ChartTooltip
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie data={chartData} dataKey="devices" nameKey="os" />
                        <ChartLegend
                            content={<ChartLegendContent nameKey="os" />}
                            className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                        />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
