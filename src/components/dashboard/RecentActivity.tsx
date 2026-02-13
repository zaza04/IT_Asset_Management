"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Device, DeviceStatus, DEVICE_STATUS_CONFIG } from "@/types/device"
import { SoftLabel } from "@/components/ui/soft-label"
import { timeAgo } from '@/lib/time'

interface RecentActivityProps {
    devices: Device[]
}

const DOT_COLORS: Record<DeviceStatus, string> = {
    active: 'bg-emerald-500',
    broken: 'bg-red-500',
    inactive: 'bg-amber-500',
}



export function RecentActivity({ devices }: RecentActivityProps) {
    const recentDevices = React.useMemo(() =>
        [...devices]
            .sort((a, b) => new Date(b.metadata.importedAt).getTime() - new Date(a.metadata.importedAt).getTime())
            .slice(0, 6),
        [devices]
    );

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Hoạt động gần đây</CardTitle>
            </CardHeader>
            <CardContent>
                {recentDevices.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8 text-sm">
                        Chưa có hoạt động nào
                    </div>
                ) : (
                    <div className="relative">
                        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
                        <div className="space-y-4">
                            {recentDevices.map((device) => {
                                const status = device.status ?? 'active'
                                const config = DEVICE_STATUS_CONFIG[status]
                                return (
                                    <div key={device.id} className="relative flex items-start gap-3 pl-6">
                                        <span className={`absolute left-0 top-1.5 h-[14px] w-[14px] rounded-full border-2 border-background ${DOT_COLORS[status]} z-10`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <p className="text-sm font-medium truncate">{device.deviceInfo.name}</p>
                                                <SoftLabel color={config.softColor} size="sm">
                                                    {config.label}
                                                </SoftLabel>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>{device.deviceInfo.os || 'Không có'}</span>
                                                <span>•</span>
                                                <span>{device.deviceInfo.ram || 'Không có'}</span>
                                                <span className="ml-auto">{timeAgo(device.metadata.importedAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
