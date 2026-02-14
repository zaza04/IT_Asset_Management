"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

// Server Actions
import {
    getDevices,
    getDeviceWithSheets,
    createDevice as createDeviceAction,
    updateDevice as updateDeviceAction,
    deleteDevice as deleteDeviceAction,
    importDevice as importDeviceAction,

    getDeviceStats,
    updateDeviceVisibleSheets as updateDeviceVisibleSheetsAction,
} from "@/app/actions/devices"
import {
    createSheet as createSheetAction,
    updateSheetData as updateSheetDataAction,
    updateSheetCell as updateSheetCellAction,
    renameSheet as renameSheetAction,
    deleteSheet as deleteSheetAction,
    reorderSheets as reorderSheetsAction,
    addSheetRow as addSheetRowAction,
    deleteSheetRow as deleteSheetRowAction,
} from "@/app/actions/device-sheets"

// Adapter — convert giữa DB types và frontend types
import {
    toFrontendDevice,
    toFrontendDeviceWithSheets,
    toSupabaseDeviceUpdate,
    toSupabaseDeviceInsert,
    buildSheetIdMap,
} from "@/lib/supabase-adapter"
import type { Device, DeviceInfo, DeviceStatus } from "@/types/device"

// ============================================
// Query Keys — centralized để invalidate chính xác
// ============================================
export const deviceKeys = {
    all: ["devices"] as const,
    list: () => [...deviceKeys.all, "list"] as const,
    detail: (id: string) => [...deviceKeys.all, "detail", id] as const,
    stats: () => [...deviceKeys.all, "stats"] as const,
}

// ============================================
// QUERIES
// ============================================

// Lấy tất cả devices (list view — không có sheets)
export function useDevicesQuery() {
    return useQuery({
        queryKey: deviceKeys.list(),
        queryFn: async () => {
            const { data, error } = await getDevices()
            if (error || !data) throw new Error(error || "Không thể tải danh sách devices")
            // Convert sang frontend Device type
            return data.map(toFrontendDevice)
        },
    })
}

// Lấy chi tiết 1 device + sheets (detail view)
export function useDeviceDetailQuery(deviceId: string | null) {
    return useQuery({
        queryKey: deviceKeys.detail(deviceId!),
        enabled: !!deviceId,
        queryFn: async () => {
            const { data, error } = await getDeviceWithSheets(deviceId!)
            if (error || !data) throw new Error(error || "Không thể tải device")

            const { device_sheets = [], ...deviceRow } = data as any
            return {
                device: toFrontendDeviceWithSheets(deviceRow, device_sheets),
                sheetIdMap: buildSheetIdMap(device_sheets),
                rawSheets: device_sheets,
            }
        },
    })
}

// Thống kê devices cho sidebar
export function useDeviceStatsQuery() {
    return useQuery({
        queryKey: deviceKeys.stats(),
        queryFn: () => getDeviceStats(),
    })
}

// ============================================
// MUTATIONS — Device CRUD
// ============================================

// Tạo device mới (thủ công — qua form)
export function useCreateDeviceMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (info: {
            name: string
            os: string
            cpu: string
            ram: string
            architecture: string
            ip: string
            mac: string
            status?: DeviceStatus
        }) => {
            const insertData = toSupabaseDeviceInsert(info)
            // Ghi đè status nếu khác default
            if (info.status) insertData.status = info.status

            const { data, error } = await createDeviceAction(insertData)
            if (error || !data) throw new Error(error || "Lỗi tạo device")
            return data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: deviceKeys.list() })
            queryClient.invalidateQueries({ queryKey: deviceKeys.stats() })
            toast.success(`Đã tạo thiết bị "${data.name}"`)
        },
        onError: (err) => {
            toast.error("Lỗi tạo thiết bị", { description: err.message })
        },
    })
}

// Import device từ Excel
export function useImportDeviceMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (params: {
            deviceData: ReturnType<typeof toSupabaseDeviceInsert>
            sheets: { sheet_name: string; sheet_data: any[]; sort_order: number }[]
        }) => {
            const { data, error } = await importDeviceAction(params.deviceData, params.sheets)
            if (error || !data) throw new Error(error || "Lỗi import")
            return data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: deviceKeys.list() })
            queryClient.invalidateQueries({ queryKey: deviceKeys.stats() })
            toast.success(`Import thành công "${data.name}"`)
        },
        onError: (err) => {
            toast.error("Import thất bại", { description: err.message })
        },
    })
}

// Update device (info, status, specs)
export function useUpdateDeviceMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (params: {
            deviceId: string
            updates: Partial<DeviceInfo>
            currentSpecs?: any
        }) => {
            const payload = toSupabaseDeviceUpdate(params.currentSpecs, params.updates)
            const { data, error } = await updateDeviceAction(params.deviceId, payload)
            if (error || !data) throw new Error(error || "Lỗi cập nhật")
            return data
        },
        onSuccess: (_data, vars) => {
            queryClient.invalidateQueries({ queryKey: deviceKeys.list() })
            queryClient.invalidateQueries({ queryKey: deviceKeys.detail(vars.deviceId) })
        },
        onError: (err) => {
            toast.error("Lỗi cập nhật thiết bị", { description: err.message })
        },
    })
}

// Update status riêng (shortcut)
export function useUpdateStatusMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (params: { deviceId: string; status: DeviceStatus }) => {
            const { data, error } = await updateDeviceAction(params.deviceId, {
                status: params.status,
                updated_at: new Date().toISOString(),
            })
            if (error || !data) throw new Error(error || "Lỗi cập nhật status")
            return data
        },
        onSuccess: (_data, vars) => {
            queryClient.invalidateQueries({ queryKey: deviceKeys.list() })
            queryClient.invalidateQueries({ queryKey: deviceKeys.detail(vars.deviceId) })
            queryClient.invalidateQueries({ queryKey: deviceKeys.stats() })
        },
    })
}

// Update visible sheets
export function useUpdateDeviceVisibleSheetsMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (params: { deviceId: string; visibleSheets: string[] }) => {
            const { success, error } = await updateDeviceVisibleSheetsAction(
                params.deviceId,
                params.visibleSheets
            )
            if (!success) throw new Error(error || "Lỗi cập nhật visible sheets")
            return params.visibleSheets
        },
        onSuccess: (_data, vars) => {
            queryClient.invalidateQueries({ queryKey: deviceKeys.detail(vars.deviceId) })
        },
    })
}

// Xóa device
export function useDeleteDeviceMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (deviceId: string) => {
            const { success, error } = await deleteDeviceAction(deviceId)
            if (!success) throw new Error(error || "Lỗi xóa")
            return deviceId
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: deviceKeys.list() })
            queryClient.invalidateQueries({ queryKey: deviceKeys.stats() })
            toast.success("Đã xóa thiết bị")
        },
        onError: (err) => {
            toast.error("Lỗi xóa thiết bị", { description: err.message })
        },
    })
}

// ============================================
// MUTATIONS — Sheet operations
// ============================================

// Tạo sheet mới
export function useCreateSheetMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (params: {
            deviceId: string
            sheetName: string
            sortOrder?: number
        }) => {
            const { data, error } = await createSheetAction({
                device_id: params.deviceId,
                sheet_name: params.sheetName,
                sheet_data: [],
                sort_order: params.sortOrder ?? 0,
            })
            if (error || !data) throw new Error(error || "Lỗi tạo sheet")
            return data
        },
        onSuccess: (_data, vars) => {
            queryClient.invalidateQueries({ queryKey: deviceKeys.detail(vars.deviceId) })
        },
    })
}

// Cập nhật 1 cell — optimistic update
export function useUpdateCellMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (params: {
            deviceId: string
            sheetId: string
            sheetName: string
            rowIndex: number
            columnKey: string
            value: any
        }) => {
            const { data, error } = await updateSheetCellAction(
                params.sheetId,
                params.rowIndex,
                params.columnKey,
                params.value
            )
            if (error || !data) throw new Error(error || "Lỗi cập nhật cell")
            return data
        },
        // Optimistic update: cập nhật cache ngay lập tức
        onMutate: async (vars) => {
            await queryClient.cancelQueries({ queryKey: deviceKeys.detail(vars.deviceId) })

            const previous = queryClient.getQueryData(deviceKeys.detail(vars.deviceId))

            queryClient.setQueryData(deviceKeys.detail(vars.deviceId), (old: any) => {
                if (!old) return old
                const updatedDevice = { ...old.device }
                const sheetData = [...(updatedDevice.sheets[vars.sheetName] || [])]
                if (sheetData[vars.rowIndex]) {
                    sheetData[vars.rowIndex] = {
                        ...sheetData[vars.rowIndex],
                        [vars.columnKey]: vars.value,
                    }
                    updatedDevice.sheets = {
                        ...updatedDevice.sheets,
                        [vars.sheetName]: sheetData,
                    }
                }
                return { ...old, device: updatedDevice }
            })

            return { previous }
        },
        // Rollback nếu server fail
        onError: (_err, vars, context) => {
            if (context?.previous) {
                queryClient.setQueryData(deviceKeys.detail(vars.deviceId), context.previous)
            }
        },
        onSettled: (_data, _err, vars) => {
            queryClient.invalidateQueries({ queryKey: deviceKeys.detail(vars.deviceId) })
        },
    })
}

// Rename sheet
export function useRenameSheetMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (params: { deviceId: string; sheetId: string; newName: string }) => {
            const { data, error } = await renameSheetAction(params.sheetId, params.newName)
            if (error || !data) throw new Error(error || "Lỗi đổi tên sheet")
            return data
        },
        onSuccess: (_data, vars) => {
            queryClient.invalidateQueries({ queryKey: deviceKeys.detail(vars.deviceId) })
        },
    })
}

// Xóa sheet
export function useDeleteSheetMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (params: { deviceId: string; sheetId: string }) => {
            const { success, error } = await deleteSheetAction(params.sheetId)
            if (!success) throw new Error(error || "Lỗi xóa sheet")
        },
        onSuccess: (_data, vars) => {
            queryClient.invalidateQueries({ queryKey: deviceKeys.detail(vars.deviceId) })
        },
    })
}

// Reorder sheets (drag & drop)
export function useReorderSheetsMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (params: {
            deviceId: string
            sheetIds: string[]
        }) => {
            // Map array of IDs to { id, sort_order }
            const sheetsOrder = params.sheetIds.map((id, i) => ({
                id,
                sort_order: i,
            }))
            const { success, error } = await reorderSheetsAction(sheetsOrder)
            if (!success) throw new Error(error || "Lỗi sắp xếp sheets")
        },
        onSuccess: (_data, vars) => {
            queryClient.invalidateQueries({ queryKey: deviceKeys.detail(vars.deviceId) })
        },
    })
}

// Thêm row vào sheet
export function useAddRowMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (params: {
            deviceId: string
            sheetId: string
            rowData?: Record<string, any>
        }) => {
            const { data, error } = await addSheetRowAction(params.sheetId, params.rowData || {})
            if (error || !data) throw new Error(error || "Lỗi thêm row")
            return data
        },
        onSuccess: (_data, vars) => {
            queryClient.invalidateQueries({ queryKey: deviceKeys.detail(vars.deviceId) })
        },
    })
}

// Xóa row
export function useDeleteRowMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (params: {
            deviceId: string
            sheetId: string
            rowIndex: number
        }) => {
            const { data, error } = await deleteSheetRowAction(params.sheetId, params.rowIndex)
            if (error || !data) throw new Error(error || "Lỗi xóa row")
            return data
        },
        onSuccess: (_data, vars) => {
            queryClient.invalidateQueries({ queryKey: deviceKeys.detail(vars.deviceId) })
        },
    })
}

// Thêm column vào sheet
export function useAddColumnMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (params: {
            deviceId: string
            sheetId: string
            columnName: string
            sheetData: any[]
        }) => {
            // Thêm column = xóa cột cũ (nếu có) hoặc just append?
            // Ở đây ta thêm key mới vào mỗi row
            const updatedData = params.sheetData.map((row) => ({
                ...row,
                [params.columnName]: "",
            }))
            const { data, error } = await updateSheetDataAction(params.sheetId, updatedData)
            if (error || !data) throw new Error(error || "Lỗi thêm column")
            return data
        },
        onSuccess: (_data, vars) => {
            queryClient.invalidateQueries({ queryKey: deviceKeys.detail(vars.deviceId) })
        },
    })
}
