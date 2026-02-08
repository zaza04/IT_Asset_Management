"use client"

import * as React from "react"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Device } from "@/types/device"

interface ImportTimelineProps {
    devices: Device[]
}

type Range = '7d' | '30d'

export function ImportTimeline({ devices }: ImportTimelineProps) {
    const [range, setRange] = React.useState<Range>('7d')
    const days = range === '7d' ? 7 : 30

    const chartData = React.useMemo(() => {
        const now = new Date()
        const data: { date: string; count: number; cumulative: number }[] = []
        let cumulative = 0

        // Đếm thiết bị import trước khoảng thời gian hiện tại
        const startDate = new Date(now)
        startDate.setDate(startDate.getDate() - days + 1)
        startDate.setHours(0, 0, 0, 0)

        devices.forEach(d => {
            if (new Date(d.metadata.importedAt) < startDate) cumulative++
        })

        for (let i = 0; i < days; i++) {
            const date = new Date(startDate)
            date.setDate(date.getDate() + i)
            const dateStr = date.toISOString().split('T')[0]

            // Đếm imports trong ngày
            const dayCount = devices.filter(d => {
                const importDate = new Date(d.metadata.importedAt).toISOString().split('T')[0]
                return importDate === dateStr
            }).length

            cumulative += dayCount
            data.push({
                date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
                count: dayCount,
                cumulative,
            })
        }
        return data
    }, [devices, days])

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold">Import Timeline</CardTitle>
                <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
                    <Button
                        variant={range === '7d' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-7 px-2.5 text-xs"
                        onClick={() => setRange('7d')}
                    >
                        7 ngày
                    </Button>
                    <Button
                        variant={range === '30d' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-7 px-2.5 text-xs"
                        onClick={() => setRange('30d')}
                    >
                        30 ngày
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis
                            dataKey="date"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            stroke="hsl(var(--muted-foreground))"
                            interval={range === '30d' ? 4 : 0}
                        />
                        <YAxis
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            stroke="hsl(var(--muted-foreground))"
                            allowDecimals={false}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '8px',
                                border: 'none',
                                boxShadow: '0 4px 12px rgb(0 0 0 / 0.12)',
                                fontSize: '12px',
                                backgroundColor: 'hsl(var(--card))',
                                color: 'hsl(var(--foreground))',
                            }}
                            formatter={(value, name) => [
                                value,
                                name === 'cumulative' ? 'Tổng cộng' : 'Import trong ngày',
                            ]}
                        />
                        <Area
                            type="monotone"
                            dataKey="cumulative"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2.5}
                            fill="url(#gradientArea)"
                            dot={false}
                            activeDot={{ r: 4, strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
