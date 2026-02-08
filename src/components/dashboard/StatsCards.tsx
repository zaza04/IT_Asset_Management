"use client"

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Laptop, FileText, Database, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { Device, DEVICE_STATUS_CONFIG } from '@/types/device';
import { SoftLabel } from '@/components/ui/soft-label';

interface StatsCardsProps {
    devices: Device[];
}

// Radial progress ring SVG (Minimal.cc style)
function RadialRing({ value, size = 56, strokeWidth = 5 }: { value: number; size?: number; strokeWidth?: number }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-muted/30"
                />
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="text-emerald-500 transition-all duration-700"
                />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                {Math.round(value)}%
            </span>
        </div>
    );
}

// Mini sparkline bar (giả lập trend từ import dates)
function SparkBars({ data }: { data: number[] }) {
    const max = Math.max(...data, 1);
    return (
        <div className="flex items-end gap-0.5 h-8">
            {data.map((v, i) => (
                <div
                    key={i}
                    className="w-1.5 rounded-full bg-primary/60 transition-all"
                    style={{ height: `${Math.max((v / max) * 100, 8)}%` }}
                />
            ))}
        </div>
    );
}

export function StatsCards({ devices }: StatsCardsProps) {
    const totalDevices = devices.length;
    const totalSheets = devices.reduce((sum, d) => sum + d.metadata.totalSheets, 0);
    const totalRecords = devices.reduce((sum, d) => sum + d.metadata.totalRows, 0);

    // Health score = % active devices
    const activeCount = devices.filter(d => (d.status ?? 'active') === 'active').length;
    const healthScore = totalDevices > 0 ? (activeCount / totalDevices) * 100 : 0;

    // Sparkline data — imports per day (last 7 days)
    const sparkData = useMemo(() => {
        const days = Array(7).fill(0);
        const now = Date.now();
        devices.forEach(d => {
            const diff = now - new Date(d.metadata.importedAt).getTime();
            const dayIndex = 6 - Math.min(Math.floor(diff / 86400000), 6);
            days[dayIndex]++;
        });
        return days;
    }, [devices]);

    const brokenCount = devices.filter(d => d.status === 'broken').length;
    const inactiveCount = devices.filter(d => d.status === 'inactive').length;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Devices + sparkline */}
            <Card className="overflow-hidden">
                <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Total Devices</p>
                            <p className="text-3xl font-bold tracking-tight">{totalDevices}</p>
                            <SoftLabel color="info" size="sm">
                                <TrendingUp className="h-3 w-3" />
                                {sparkData[6]} today
                            </SoftLabel>
                        </div>
                        <SparkBars data={sparkData} />
                    </div>
                </CardContent>
            </Card>

            {/* Health Score — radial ring */}
            <Card className="overflow-hidden">
                <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Health Score</p>
                            <p className="text-3xl font-bold tracking-tight">{activeCount}<span className="text-lg text-muted-foreground font-normal">/{totalDevices}</span></p>
                            <div className="flex gap-1.5">
                                {brokenCount > 0 && (
                                    <SoftLabel color="error" size="sm">{brokenCount} hỏng</SoftLabel>
                                )}
                                {inactiveCount > 0 && (
                                    <SoftLabel color="default" size="sm">{inactiveCount} off</SoftLabel>
                                )}
                                {brokenCount === 0 && inactiveCount === 0 && (
                                    <SoftLabel color="success" size="sm">All healthy</SoftLabel>
                                )}
                            </div>
                        </div>
                        <RadialRing value={healthScore} />
                    </div>
                </CardContent>
            </Card>

            {/* Total Sheets */}
            <Card className="overflow-hidden">
                <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Total Sheets</p>
                            <p className="text-3xl font-bold tracking-tight">{totalSheets}</p>
                            <p className="text-xs text-muted-foreground">
                                avg {totalDevices > 0 ? Math.round(totalSheets / totalDevices) : 0} per device
                            </p>
                        </div>
                        <div className="rounded-xl bg-primary/10 p-3">
                            <FileText className="h-5 w-5 text-primary" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Total Records */}
            <Card className="overflow-hidden">
                <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Total Records</p>
                            <p className="text-3xl font-bold tracking-tight">{totalRecords.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">
                                avg {totalDevices > 0 ? Math.round(totalRecords / totalDevices).toLocaleString() : 0} per device
                            </p>
                        </div>
                        <div className="rounded-xl bg-amber-500/10 p-3">
                            <Database className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
