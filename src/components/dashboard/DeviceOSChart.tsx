"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Device } from "@/types/device"

interface DeviceOSChartProps {
    devices: Device[]
}

// Color palette cho các OS phổ biến
const OS_COLORS: Record<string, string> = {
    'Windows 10': '#0078d4',
    'Windows 11': '#00a4ef',
    'Windows': '#0078d4',
    'macOS': '#555555',
    'Linux': '#f5a623',
    'Ubuntu': '#e95420',
    'CentOS': '#932279',
    'Chrome OS': '#4285f4',
}
const DEFAULT_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#14b8a6', '#06b6d4']

function getOSColor(os: string, index: number): string {
    const match = Object.entries(OS_COLORS).find(([key]) => os.toLowerCase().includes(key.toLowerCase()))
    return match ? match[1] : DEFAULT_COLORS[index % DEFAULT_COLORS.length]
}

export function DeviceOSChart({ devices }: DeviceOSChartProps) {
    const chartData = React.useMemo(() => {
        const osCounts: Record<string, number> = {}
        devices.forEach((device) => {
            const os = device.deviceInfo.os || "Unknown"
            osCounts[os] = (osCounts[os] || 0) + 1
        })

        return Object.entries(osCounts)
            .map(([os, count]) => ({ os, count, percent: Math.round((count / devices.length) * 100) }))
            .sort((a, b) => b.count - a.count)
    }, [devices])

    const maxCount = Math.max(...chartData.map(d => d.count), 1)

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">OS Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3.5">
                    {chartData.map((item, index) => {
                        const color = getOSColor(item.os, index)
                        return (
                            <div key={item.os} className="space-y-1.5">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium truncate">{item.os}</span>
                                    <span className="text-muted-foreground ml-2 tabular-nums">
                                        {item.count} <span className="text-xs">({item.percent}%)</span>
                                    </span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-700"
                                        style={{
                                            width: `${(item.count / maxCount) * 100}%`,
                                            backgroundColor: color,
                                        }}
                                    />
                                </div>
                            </div>
                        )
                    })}
                    {chartData.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No data</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
