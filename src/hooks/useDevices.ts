import { useDeviceStore } from '@/stores/useDeviceStore';
import { useShallow } from 'zustand/react/shallow';

// Selector chọn đúng fields cần — tránh re-render khi transient state thay đổi
export const useDevices = () => {
    return useDeviceStore(
        useShallow((s) => ({
            devices: s.devices,
            selectedDevice: s.selectedDevice,
            setSelectedDevice: s.setSelectedDevice,
            isLoading: s.isLoading,
            addDevice: s.addDevice,
            addMultipleDevices: s.addMultipleDevices,
            removeDevice: s.removeDevice,
            exportDevice: s.exportDevice,
        }))
    );
};

// Selector nhẹ — chỉ lấy devices array
export const useDeviceList = () => {
    return useDeviceStore((s) => s.devices);
};
