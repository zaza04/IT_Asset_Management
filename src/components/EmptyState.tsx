import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon: LucideIcon;
    iconSize?: number;
    title: string;
    description: string;
    action?: React.ReactNode;
    className?: string;
}

export function EmptyState({
    icon: Icon,
    iconSize = 64,
    title,
    description,
    action,
    className = '',
}: EmptyStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
            {/* Icon */}
            <div className="mb-4 text-muted-foreground/60">
                <Icon size={iconSize} strokeWidth={1} aria-hidden="true" />
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">{description}</p>

            {/* Action Button */}
            {action && <div className="mt-2">{action}</div>}
        </div>
    );
}
