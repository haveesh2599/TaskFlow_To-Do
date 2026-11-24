import { Plus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function TaskListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading tasks">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="bg-[#FFFFFF] border border-[#E5E9E4] rounded-lg px-5 py-4 animate-pulse"
        >
          <div className="flex items-start gap-3">
            <div className="w-[18px] h-[18px] rounded bg-[#E5E9E4] mt-0.5 shrink-0" />
            <div className="flex-1 space-y-2.5">
              <div className="h-4 bg-[#E5E9E4] rounded w-2/5" />
              <div className="h-3 bg-[#F0F2EE] rounded w-3/5" />
              <div className="flex items-center gap-3 pt-1">
                <div className="h-3 bg-[#F0F2EE] rounded w-24" />
                <div className="h-4 bg-[#F0F2EE] rounded w-16" />
                <div className="h-4 bg-[#F0F2EE] rounded w-20" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="bg-[#FFFFFF] border border-[#E5E9E4] rounded-xl px-6 py-12 text-center">
      <div className="w-10 h-10 rounded-lg bg-[#EAF1EA] text-[#52765D] flex items-center justify-center mx-auto mb-3.5">
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-[#252A26] mb-1">{title}</h3>
      <p className="text-sm text-[#777F78] max-w-sm mx-auto leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#52765D] hover:bg-[#42634C] rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>{actionLabel}</span>
        </button>
      ) : null}
    </div>
  );
}
