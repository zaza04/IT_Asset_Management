"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Device } from "@/types/device"

interface HardwareOverviewProps {
    devices: Device[]
}

// Nhóm RAM (parse "16 GB" → 16)
function parseRAM(ram: string): number {
    const match = ram.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
}

// Grouping theo ranges
function groupByRange<T>(items: T[], getValue: (item: T) => number, ranges: { label: string; min: number; max: number }[]) {
    return ranges.map(range => ({
        ...range,
        count: items.filter(item => {
            const val = getValue(item);
            return val >= range.min && val < range.max;
        }).length,
    }));
}

// Treemap-style grid blocks
function TreemapBlocks({ data, total }: { data: { label: string; count: number }[]; total: number }) {
    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#14b8a6', '#06b6d4', '#84cc16']
    const filtered = data.filter(d => d.count > 0)

    return (
        <div className="space-y-2.5">
            {/* Proportional bar */}
            <div className="flex h-3 w-full rounded-full overflow-hidden bg-muted/30 gap-0.5">
                {filtered.map((item, i) => (
                    <div
                        key={item.label}
                        className="h-full rounded-full transition-all duration-700 first:rounded-l-full last:rounded-r-full"
                        style={{
                            width: `${Math.max((item.count / total) * 100, 2)}%`,
                            backgroundColor: COLORS[i % COLORS.length],
                        }}
                        title={`${item.label}: ${item.count}`}
                    />
                ))}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2">
                {filtered.map((item, i) => (
                    <div key={item.label} className="flex items-center gap-2">
                        <span
                            className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        <span className="text-xs text-muted-foreground truncate">{item.label}</span>
                        <span className="ml-auto text-xs font-semibold tabular-nums">{item.count}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function HardwareOverview({ devices }: HardwareOverviewProps) {
    const ramData = React.useMemo(() => {
        const ranges = [
            { label: '≤ 4 GB', min: 0, max: 5 },
            { label: '8 GB', min: 5, max: 12 },
            { label: '16 GB', min: 12, max: 24 },
            { label: '32 GB', min: 24, max: 48 },
            { label: '64+ GB', min: 48, max: Infinity },
        ]
        return groupByRange(devices, d => parseRAM(d.deviceInfo.ram), ranges)
    }, [devices])

    // Nhóm CPU brands
    const cpuData = React.useMemo(() => {
        const brands: Record<string, number> = {}
        devices.forEach(d => {
            const cpu = d.deviceInfo.cpu.toLowerCase()
            let brand = 'Other'
            if (cpu.includes('i3') || cpu.includes('core i3')) brand = 'Intel i3'
            else if (cpu.includes('i5') || cpu.includes('core i5')) brand = 'Intel i5'
            else if (cpu.includes('i7') || cpu.includes('core i7')) brand = 'Intel i7'
            else if (cpu.includes('i9') || cpu.includes('core i9')) brand = 'Intel i9'
            else if (cpu.includes('ryzen 3')) brand = 'Ryzen 3'
            else if (cpu.includes('ryzen 5')) brand = 'Ryzen 5'
            else if (cpu.includes('ryzen 7')) brand = 'Ryzen 7'
            else if (cpu.includes('ryzen 9')) brand = 'Ryzen 9'
            else if (cpu.includes('xeon')) brand = 'Xeon'
            else if (cpu.includes('intel')) brand = 'Intel Other'
            else if (cpu.includes('amd')) brand = 'AMD Other'
            else if (cpu.includes('apple') || cpu.includes('m1') || cpu.includes('m2') || cpu.includes('m3')) brand = 'Apple Silicon'
            brands[brand] = (brands[brand] || 0) + 1
        })
        return Object.entries(brands)
            .map(([label, count]) => ({ label, count }))
            .sort((a, b) => b.count - a.count)
    }, [devices])

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Hardware Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="ram">
                    <TabsList className="h-8 mb-3">
                        <TabsTrigger value="ram" className="text-xs px-3 h-7">RAM</TabsTrigger>
                        <TabsTrigger value="cpu" className="text-xs px-3 h-7">CPU</TabsTrigger>
                    </TabsList>
                    <TabsContent value="ram" className="mt-0">
                        <TreemapBlocks data={ramData} total={devices.length} />
                    </TabsContent>
                    <TabsContent value="cpu" className="mt-0">
                        <TreemapBlocks data={cpuData} total={devices.length} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
