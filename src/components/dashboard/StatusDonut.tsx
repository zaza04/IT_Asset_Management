"use client"

import * as React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Device, DeviceStatus, DEVICE_STATUS_CONFIG } from "@/types/device"
import { SoftLabel } from "@/components/ui/soft-label"

interface StatusDonutProps {
    devices: Device[]
}

const DONUT_COLORS: Record<DeviceStatus, string> = {
    active: '#10b981',   // emerald-500
    broken: '#ef4444',   // red-500
    inactive: '#9ca3af', // gray-400
}

export function StatusDonut({ devices }: StatusDonutProps) {
    const data = React.useMemo(() => {
        const counts: Record<DeviceStatus, number> = { active: 0, broken: 0, inactive: 0 }
        devices.forEach(d => {
            const s = d.status ?? 'active'
            counts[s]++
        })
        return Object.entries(counts)
            .filter(([, count]) => count > 0)
            .map(([status, count]) => ({
                name: DEVICE_STATUS_CONFIG[status as DeviceStatus].label,
                value: count,
                status: status as DeviceStatus,
            }))
    }, [devices])

    const activePercent = devices.length > 0
        ? Math.round((devices.filter(d => (d.status ?? 'active') === 'active').length / devices.length) * 100)
        : 0

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Device Status</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-6">
                    {/* Donut chart */}
                    <div className="relative">
                        <ResponsiveContainer width={140} height={140}>
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={45}
                                    outerRadius={65}
                                    paddingAngle={3}
                                    dataKey="value"
                                    strokeWidth={0}
                                >
                                    {data.map((entry) => (
                                        <Cell key={entry.status} fill={DONUT_COLORS[entry.status]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center label */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold">{activePercent}%</span>
                            <span className="text-[10px] text-muted-foreground">Active</span>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-col gap-3">
                        {data.map((entry) => (
                            <div key={entry.status} className="flex items-center gap-2.5">
                                <span
                                    className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: DONUT_COLORS[entry.status] }}
                                />
                                <div>
                                    <p className="text-sm font-medium">{entry.value}</p>
                                    <p className="text-xs text-muted-foreground">{entry.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
