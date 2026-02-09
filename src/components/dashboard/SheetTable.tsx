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

export function SheetTable({ data, sheetName, deviceId, readOnly, onCellUpdate }: SheetTableProps) {
    const parentRef = useRef<HTMLDivElement>(null);

    if (!data || data.length === 0) {
        return <div className="p-4 text-center text-muted-foreground">No data in this sheet</div>;
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

// Inline edit cell component
function EditableCell({
    value,
    rowIndex,
    column,
    isEditing,
    isLastColumn,
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

    if (!isEditing) {
        return (
            <TableCell
                className={`flex-1 min-w-0 whitespace-nowrap px-4 py-3 ${onStartEdit ? 'cursor-text' : ''} ${borderClass}`}
                onDoubleClick={onStartEdit || undefined}
            >
                {value}
            </TableCell>
        );
    }

    return (
        <TableCell className={`flex-1 min-w-0 p-0.5 ${borderClass}`}>
            <Input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="h-8 text-sm border-primary/50 focus-visible:ring-1"
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
            <table className="w-full caption-bottom text-sm text-left">
                <thead className="[&_tr]:border-b sticky top-0 bg-background z-10 shadow-sm">
                    <TableRow className="flex w-full">
                        {headers.map((header, idx) => (
                            <TableHead key={header} className={`flex-1 min-w-0 whitespace-nowrap px-4 py-3 bg-muted/50 font-medium text-foreground ${idx < headers.length - 1 ? 'border-r border-border/50' : ''}`}>
                                {header}
                            </TableHead>
                        ))}
                    </TableRow>
                </thead>
                <tbody className="[&_tr:last-child]:border-0" style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                        const row = data[virtualRow.index];
                        return (
                            <TableRow
                                key={virtualRow.index}
                                className="hover:bg-muted/5 border-b flex w-full"
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
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
