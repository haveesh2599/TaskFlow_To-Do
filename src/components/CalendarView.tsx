import { useMemo, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Task } from '../types/task';

interface CalendarViewProps {
  tasks: Task[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarView({
  tasks,
  selectedDate,
  onSelectDate,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(() =>
    startOfMonth(selectedDate || new Date())
  );

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const gridStart = startOfWeek(monthStart);
    const gridEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [currentMonth]);

  const tasksByDayKey = useMemo(() => {
    const map = new Map<string, { total: number; pending: number }>();
    for (const task of tasks) {
      const key = format(task.dueDate, 'yyyy-MM-dd');
      const existing = map.get(key) || { total: 0, pending: 0 };
      existing.total += 1;
      if (!task.completed) existing.pending += 1;
      map.set(key, existing);
    }
    return map;
  }, [tasks]);

  const handleJumpToday = () => {
    const today = new Date();
    setCurrentMonth(startOfMonth(today));
    onSelectDate(today);
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E9E4] rounded-xl p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h2 className="text-base font-semibold text-[#252A26]">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleJumpToday}
            className="px-2.5 py-1 text-xs font-medium text-[#52765D] hover:bg-[#EAF1EA] rounded-md transition-colors cursor-pointer"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            aria-label="Previous month"
            className="p-1.5 text-[#777F78] hover:text-[#252A26] hover:bg-[#F6F7F4] rounded-md transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            aria-label="Next month"
            className="p-1.5 text-[#777F78] hover:text-[#252A26] hover:bg-[#F6F7F4] rounded-md transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1.5">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-[11px] font-medium text-[#777F78] py-1"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const inMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          const today = isToday(day);
          const key = format(day, 'yyyy-MM-dd');
          const dayStats = tasksByDayKey.get(key);

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDate(day)}
              aria-label={format(day, 'MMMM d, yyyy')}
              aria-pressed={isSelected}
              className={`relative h-10 rounded-lg flex flex-col items-center justify-center text-xs tabular-nums transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-[#52765D] text-white font-semibold'
                  : today
                    ? 'bg-[#EAF1EA] text-[#42634C] font-semibold'
                    : inMonth
                      ? 'text-[#252A26] hover:bg-[#F6F7F4] font-medium'
                      : 'text-[#A8B0A9] hover:bg-[#F6F7F4]'
              }`}
            >
              <span>{format(day, 'd')}</span>
              {dayStats && dayStats.total > 0 ? (
                <span
                  className={`mt-0.5 text-[10px] leading-none font-medium ${
                    isSelected
                      ? 'text-white/90'
                      : dayStats.pending > 0
                        ? 'text-[#52765D]'
                        : 'text-[#777F78]'
                  }`}
                >
                  {dayStats.total}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
