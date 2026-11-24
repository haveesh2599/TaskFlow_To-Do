import { format } from 'date-fns';
import { Menu, Plus } from 'lucide-react';
import type { NavSection } from '../types/task';
import { getGreetingByTime } from '../utils/taskHelpers';

interface HeaderProps {
  activeSection: NavSection;
  userName: string;
  pendingTodayCount: number;
  onOpenMobileMenu: () => void;
  onAddTask: () => void;
}

const SECTION_COPY: Record<
  Exclude<NavSection, 'dashboard'>,
  { title: string; subtitle: string }
> = {
  'my-tasks': {
    title: 'My Tasks',
    subtitle: 'Search, filter, and organize everything on your plate.',
  },
  today: {
    title: 'Today',
    subtitle: 'Focus on tasks scheduled for today.',
  },
  upcoming: {
    title: 'Upcoming',
    subtitle: 'Plan ahead by deadline and browse your monthly calendar.',
  },
  completed: {
    title: 'Completed',
    subtitle: 'Review finished tasks or restore items back to active.',
  },
  categories: {
    title: 'Categories',
    subtitle: 'Browse tasks grouped by area of focus.',
  },
  settings: {
    title: 'Settings',
    subtitle: 'Manage your profile and default task preferences.',
  },
};

export function Header({
  activeSection,
  userName,
  pendingTodayCount,
  onOpenMobileMenu,
  onAddTask,
}: HeaderProps) {
  const now = new Date();
  const formattedDate = format(now, 'EEEE, MMMM d, yyyy');

  const isDashboard = activeSection === 'dashboard';
  const title = isDashboard
    ? `${getGreetingByTime(now)}, ${userName}`
    : SECTION_COPY[activeSection].title;

  const subtitle = isDashboard
    ? pendingTodayCount > 0
      ? `You have ${pendingTodayCount} pending ${pendingTodayCount === 1 ? 'task' : 'tasks'} scheduled for today.`
      : 'Your schedule is clear for today. Add a task whenever you are ready.'
    : SECTION_COPY[activeSection].subtitle;

  return (
    <header className="bg-[#FFFFFF] border-b border-[#E5E9E4] px-4 sm:px-8 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
            className="lg:hidden mt-0.5 p-2 -ml-2 text-[#252A26] hover:bg-[#F6F7F4] rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <p className="text-xs font-medium text-[#777F78] tabular-nums mb-0.5">
              {formattedDate}
            </p>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#252A26] tracking-tight truncate">
              {title}
            </h1>
            <p className="text-sm text-[#777F78] mt-0.5 truncate">{subtitle}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onAddTask}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#52765D] hover:bg-[#42634C] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Add Task</span>
        </button>
      </div>
    </header>
  );
}
