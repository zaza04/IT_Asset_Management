'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DeviceStatus, DEVICE_STATUS_CONFIG } from '@/types/device';
import { useDeviceStore } from '@/stores/useDeviceStore';
import { Monitor, Cpu, HardDrive, Laptop, Network, Loader2 } from 'lucide-react';

interface CreateDeviceDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated?: (deviceId: string) => void;
}

// Form state local — chỉ ghi store khi Submit
interface FormData {
    name: string;
    os: string;
    cpu: string;
    ram: string;
    architecture: string;
    ip: string;
    mac: string;
    status: DeviceStatus;
}

const INITIAL_FORM: FormData = {
    name: '', os: '', cpu: '', ram: '',
    architecture: '', ip: '', mac: '', status: 'active',
};

export function CreateDeviceDialog({ isOpen, onClose, onCreated }: CreateDeviceDialogProps) {
    const [form, setForm] = useState<FormData>(INITIAL_FORM);
    const [isCreating, setIsCreating] = useState(false);
    const createDevice = useDeviceStore((s) => s.createDevice);

    const updateField = (field: keyof FormData, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!form.name.trim()) return;

        setIsCreating(true);
        try {
            const device = createDevice({
                name: form.name, os: form.os, cpu: form.cpu, ram: form.ram,
                architecture: form.architecture, ip: form.ip, mac: form.mac,
            });
            // Set status nếu khác default
            if (form.status !== 'active') {
                useDeviceStore.getState().setDeviceStatus(device.id, form.status);
            }
            setForm(INITIAL_FORM);
            onClose();
            onCreated?.(device.id);
        } finally {
            setIsCreating(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setForm(INITIAL_FORM);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Tạo thiết bị mới</DialogTitle>
                    <DialogDescription>
                        Nhập thông tin thiết bị. Có thể thêm sheets và dữ liệu sau.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Tên thiết bị — required */}
                    <div className="grid gap-2">
                        <Label htmlFor="device-name" className="flex items-center gap-1.5">
                            <Monitor className="h-3.5 w-3.5" />
                            Tên thiết bị <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="device-name"
                            name="deviceName"
                            type="text"
                            placeholder="VD: PC-IT-001"
                            value={form.name}
                            onChange={(e) => updateField('name', e.target.value)}
                            autoComplete="off"
                            autoFocus={typeof window !== 'undefined' && !/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)}
                        />
                    </div>

                    {/* OS + Architecture — 2 cột */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="device-os" className="flex items-center gap-1.5">
                                <Laptop className="h-3.5 w-3.5" />
                                OS
                            </Label>
                            <Input
                                id="device-os"
                                name="deviceOs"
                                type="text"
                                placeholder="Windows 11 Pro"
                                value={form.os}
                                onChange={(e) => updateField('os', e.target.value)}
                                autoComplete="off"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="device-arch">Architecture</Label>
                            <Input
                                id="device-arch"
                                name="deviceArchitecture"
                                type="text"
                                placeholder="x64"
                                value={form.architecture}
                                onChange={(e) => updateField('architecture', e.target.value)}
                                autoComplete="off"
                            />
                        </div>
                    </div>

                    {/* CPU + RAM — 2 cột */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="device-cpu" className="flex items-center gap-1.5">
                                <Cpu className="h-3.5 w-3.5" />
                                CPU
                            </Label>
                            <Input
                                id="device-cpu"
                                name="deviceCpu"
                                type="text"
                                placeholder="Intel i5-12400"
                                value={form.cpu}
                                onChange={(e) => updateField('cpu', e.target.value)}
                                autoComplete="off"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="device-ram" className="flex items-center gap-1.5">
                                <HardDrive className="h-3.5 w-3.5" />
                                RAM
                            </Label>
                            <Input
                                id="device-ram"
                                name="deviceRam"
                                type="text"
                                placeholder="16 GB"
                                value={form.ram}
                                onChange={(e) => updateField('ram', e.target.value)}
                                autoComplete="off"
                            />
                        </div>
                    </div>

                    {/* IP + MAC — 2 cột */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="device-ip">
                                <Network className="h-3.5 w-3.5 inline mr-1.5" />
                                IP
                            </Label>
                            <Input
                                id="device-ip"
                                name="deviceIp"
                                type="text"
                                placeholder="192.168.1.100"
                                value={form.ip}
                                onChange={(e) => updateField('ip', e.target.value)}
                                autoComplete="off"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="device-mac">MAC</Label>
                            <Input
                                id="device-mac"
                                name="deviceMac"
                                type="text"
                                placeholder="AA:BB:CC:DD:EE:FF"
                                value={form.mac}
                                onChange={(e) => updateField('mac', e.target.value)}
                                autoComplete="off"
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div className="grid gap-2">
                        <Label>Trạng thái</Label>
                        <Select value={form.status} onValueChange={(v) => updateField('status', v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(DEVICE_STATUS_CONFIG).map(([key, config]) => (
                                    <SelectItem key={key} value={key}>
                                        {config.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isCreating}>
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit} disabled={!form.name.trim() || isCreating}>
                        {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isCreating ? 'Đang tạo…' : 'Tạo thiết bị'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
