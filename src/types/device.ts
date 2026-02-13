

// Trạng thái thiết bị
export type DeviceStatus = 'active' | 'broken' | 'inactive';

export const DEVICE_STATUS_CONFIG = {
  active: { label: 'Đang sử dụng', softColor: 'success' as const },
  broken: { label: 'Hư hỏng', softColor: 'error' as const },
  inactive: { label: 'Không sử dụng', softColor: 'warning' as const },
} as const;

// Device data structure
export interface DeviceInfo {
  name: string;
  os: string;
  cpu: string;
  ram: string;
  architecture: string;
  ip: string;
  mac: string;
  lastUpdate: string;
}

export interface DeviceMetadata {
  totalSheets: number;
  totalRows: number;
  fileSize: string;
  importedAt: string;
  tags: string[];
  // Sheet nào được hiển thị (override per device, null = dùng global default)
  visibleSheets?: string[];
}

export interface Device {
  id: string;
  status: DeviceStatus;
  deviceInfo: DeviceInfo;
  fileName: string;
  sheets: {
    [sheetName: string]: any[];
  };
  metadata: DeviceMetadata;
}

// Sheet names mapping - Tieng Viet khong dau de nhat quan voi Python output
export const SHEET_NAMES = {
  cau_hinh: 'Cau hinh',
  license: 'License',
  driver: 'Driver',
  o_cung: 'O cung',
  ram: 'RAM',
  phan_mem: 'Phan mem',
  bios_info: 'BIOS Info',
  lan: 'LAN',
} as const;

export type SheetNameKey = keyof typeof SHEET_NAMES;
