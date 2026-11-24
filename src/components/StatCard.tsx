import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
  hint?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'neutral',
  hint,
}: StatCardProps) {
  const toneStyles = {
    neutral: {
      iconWrap: 'bg-[#F6F7F4] text-[#52765D]',
      valueText: 'text-[#252A26]',
    },
    success: {
      iconWrap: 'bg-[#EAF1EA] text-[#3F8559]',
      valueText: 'text-[#252A26]',
    },
    warning: {
      iconWrap: 'bg-[#FBF3E4] text-[#D69A42]',
      valueText: 'text-[#252A26]',
    },
    danger: {
      iconWrap: 'bg-[#FBECEB] text-[#D65B55]',
      valueText: value > 0 ? 'text-[#D65B55]' : 'text-[#252A26]',
    },
  }[tone];

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E9E4] rounded-xl p-5 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs font-medium text-[#777F78] mb-1.5 truncate">
          {label}
        </p>
        <p className={`text-2xl font-semibold tabular-nums leading-tight ${toneStyles.valueText}`}>
          {value}
        </p>
        {hint ? (
          <p className="text-xs text-[#777F78] mt-1.5 truncate">{hint}</p>
        ) : null}
      </div>
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${toneStyles.iconWrap}`}
        aria-hidden="true"
      >
        <Icon className="w-4 h-4" />
      </div>
    </div>
  );
}
