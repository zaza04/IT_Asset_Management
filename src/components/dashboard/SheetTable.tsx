import {
    TableCell,
    TableHead,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useRef, useState, useCallback, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface SheetTableProps {
    data: any[];
    sheetName: string;
    deviceId?: string;
    readOnly?: boolean;
    onCellUpdate?: (rowIndex: number, column: string, value: any) => void;
}

// Cell đang được chỉnh sửa
interface EditingCell {
    rowIndex: number;
    column: string;
}

// Chiều rộng tối thiểu của cột (px)
const MIN_COL_WIDTH = 80;
// Chiều rộng mặc định của cột (px)
const DEFAULT_COL_WIDTH = 250;

export function SheetTable({ data, sheetName, deviceId, readOnly, onCellUpdate }: SheetTableProps) {
    const parentRef = useRef<HTMLDivElement>(null);

    if (!data || data.length === 0) {
        return <div className="p-4 text-center text-muted-foreground">Không có dữ liệu trong sheet này</div>;
    }

    const headers = Object.keys(data[0]);

    // Single-row card view (không cần virtual)
    if (data.length === 1) {
        const row = data[0];
        return (
            <div className="h-full w-full overflow-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {headers.map((header) => (
                        <div key={header} className="space-y-1.5 p-4 rounded-lg border bg-card/50 hover:bg-card transition-colors">
                            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                {header}
                            </h4>
                            <p className="text-sm font-medium text-foreground break-words">
                                {row[header]?.toString() || '-'}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return <VirtualTable data={data} headers={headers} parentRef={parentRef} onCellUpdate={readOnly ? undefined : onCellUpdate} />;
}

// Inline edit cell component — text truncate + native tooltip
function EditableCell({
    value,
    rowIndex,
    column,
    isEditing,
    isLastColumn,
    width,
    onStartEdit,
    onSave,
    onCancel,
    onNavigate,
}: {
    value: any;
    rowIndex: number;
    column: string;
    isEditing: boolean;
    isLastColumn?: boolean;
    width: number;
    onStartEdit: (() => void) | null;
    onSave: (value: any) => void;
    onCancel: () => void;
    onNavigate: (direction: 'next' | 'prev') => void;
}) {
    const [editValue, setEditValue] = useState(String(value ?? ''));
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing) {
            setEditValue(String(value ?? ''));
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing, value]);

    const borderClass = isLastColumn ? '' : 'border-r border-border/50';
    const displayValue = String(value ?? '');

    if (!isEditing) {
        return (
            <TableCell
                className={`whitespace-nowrap px-4 py-3 ${onStartEdit ? 'cursor-text' : ''} ${borderClass}`}
                style={{ width, minWidth: width }}
                onDoubleClick={onStartEdit || undefined}
            >
                {displayValue}
            </TableCell>
        );
    }

    return (
        <TableCell
            className={`p-0.5 ${borderClass}`}
            style={{ width, minWidth: width }}
        >
            <Input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="h-8 text-sm border-primary/50 focus-visible:ring-1"
                aria-label="Chỉnh sửa ô"
                onBlur={() => onSave(editValue)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        onSave(editValue);
                        onNavigate('next');
                    } else if (e.key === 'Tab') {
                        e.preventDefault();
                        onSave(editValue);
                        onNavigate(e.shiftKey ? 'prev' : 'next');
                    } else if (e.key === 'Escape') {
                        onCancel();
                    }
                }}
            />
        </TableCell>
    );
}

// Hook quản lý resize cột — drag handle giữa các header
function useColumnResize(headers: string[]) {
    // Khởi tạo width mặc định cho mỗi cột
    const [colWidths, setColWidths] = useState<Record<string, number>>(() => {
        const widths: Record<string, number> = {};
        headers.forEach(h => { widths[h] = DEFAULT_COL_WIDTH; });
        return widths;
    });

    // Cập nhật khi headers thay đổi (thêm/xóa cột)
    useEffect(() => {
        setColWidths(prev => {
            const next = { ...prev };
            headers.forEach(h => {
                if (!(h in next)) next[h] = DEFAULT_COL_WIDTH;
            });
            return next;
        });
    }, [headers]);

    // State khi đang drag resize
    const [resizing, setResizing] = useState<{
        column: string;
        startX: number;
        startWidth: number;
    } | null>(null);

    // Mouse move handler — tính width mới dựa trên delta X
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!resizing) return;
        const delta = e.clientX - resizing.startX;
        const newWidth = Math.max(MIN_COL_WIDTH, resizing.startWidth + delta);
        setColWidths(prev => ({ ...prev, [resizing.column]: newWidth }));
    }, [resizing]);

    // Mouse up handler — kết thúc resize
    const handleMouseUp = useCallback(() => {
        setResizing(null);
    }, []);

    // Attach/detach global mouse listeners khi đang resize
    useEffect(() => {
        if (resizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            // Ngăn text selection khi đang drag
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'col-resize';
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        };
    }, [resizing, handleMouseMove, handleMouseUp]);

    // Bắt đầu resize khi mousedown trên drag handle
    const startResize = useCallback((column: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setResizing({
            column,
            startX: e.clientX,
            startWidth: colWidths[column] || DEFAULT_COL_WIDTH,
        });
    }, [colWidths]);

    // Tổng chiều rộng của tất cả cột
    const totalWidth = headers.reduce((sum, h) => sum + (colWidths[h] || DEFAULT_COL_WIDTH), 0);

    return { colWidths, startResize, isResizing: !!resizing, totalWidth };
}

// Virtualized table — chỉ render rows visible trên viewport
function VirtualTable({
    data,
    headers,
    parentRef,
    onCellUpdate,
}: {
    data: any[];
    headers: string[];
    parentRef: React.RefObject<HTMLDivElement | null>;
    onCellUpdate?: (rowIndex: number, column: string, value: any) => void;
}) {
    const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
    const { colWidths, startResize, isResizing, totalWidth } = useColumnResize(headers);

    const rowVirtualizer = useVirtualizer({
        count: data.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 40,
        overscan: 10,
    });

    const handleSave = useCallback((rowIndex: number, column: string, value: any) => {
        if (onCellUpdate && data[rowIndex][column] !== value) {
            onCellUpdate(rowIndex, column, value);
        }
        setEditingCell(null);
    }, [onCellUpdate, data]);

    // Tab/Enter navigation — di chuyển đến cell tiếp theo
    const handleNavigate = useCallback((rowIndex: number, column: string, direction: 'next' | 'prev') => {
        const colIdx = headers.indexOf(column);
        if (direction === 'next') {
            if (colIdx < headers.length - 1) {
                setEditingCell({ rowIndex, column: headers[colIdx + 1] });
            } else if (rowIndex < data.length - 1) {
                setEditingCell({ rowIndex: rowIndex + 1, column: headers[0] });
            } else {
                setEditingCell(null);
            }
        } else {
            if (colIdx > 0) {
                setEditingCell({ rowIndex, column: headers[colIdx - 1] });
            } else if (rowIndex > 0) {
                setEditingCell({ rowIndex: rowIndex - 1, column: headers[headers.length - 1] });
            } else {
                setEditingCell(null);
            }
        }
    }, [headers, data.length]);

    return (
        <div ref={parentRef} className="h-full w-full overflow-auto">
            <table
                className="caption-bottom text-sm text-left"
                style={{ width: totalWidth, minWidth: '100%' }}
            >
                <thead className="[&_tr]:border-b sticky top-0 bg-background z-10 shadow-sm">
                    <TableRow className="flex" style={{ width: totalWidth }}>
                        {headers.map((header, idx) => {
                            const w = colWidths[header] || DEFAULT_COL_WIDTH;
                            const isLast = idx === headers.length - 1;
                            return (
                                <TableHead
                                    key={header}
                                    className={`relative whitespace-nowrap px-4 py-3 bg-muted/50 font-medium text-foreground ${!isLast ? 'border-r border-border/50' : ''}`}
                                    style={{ width: w, minWidth: w }}
                                >
                                    {header}
                                    {/* Drag handle — border phải của header, kéo để resize */}
                                    {!isLast && (
                                        <span
                                            className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-primary/30 active:bg-primary/50 transition-colors z-20"
                                            onMouseDown={(e) => startResize(header, e)}
                                            role="separator"
                                            aria-label={`Kéo để thay đổi độ rộng cột ${header}`}
                                        />
                                    )}
                                </TableHead>
                            );
                        })}
                    </TableRow>
                </thead>
                <tbody className="[&_tr:last-child]:border-0" style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                        const row = data[virtualRow.index];
                        return (
                            <TableRow
                                key={virtualRow.index}
                                className="hover:bg-muted/5 border-b flex"
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: totalWidth,
                                    height: `${virtualRow.size}px`,
                                    transform: `translateY(${virtualRow.start}px)`,
                                }}
                            >
                                {headers.map((header, idx) => (
                                    <EditableCell
                                        key={`${virtualRow.index}-${header}`}
                                        value={row[header]}
                                        rowIndex={virtualRow.index}
                                        column={header}
                                        isEditing={
                                            editingCell?.rowIndex === virtualRow.index &&
                                            editingCell?.column === header
                                        }
                                        isLastColumn={idx === headers.length - 1}
                                        width={colWidths[header] || DEFAULT_COL_WIDTH}
                                        onStartEdit={onCellUpdate
                                            ? () => setEditingCell({ rowIndex: virtualRow.index, column: header })
                                            : null}
                                        onSave={(value) => handleSave(virtualRow.index, header, value)}
                                        onCancel={() => setEditingCell(null)}
                                        onNavigate={(dir) => handleNavigate(virtualRow.index, header, dir)}
                                    />
                                ))}
                            </TableRow>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
