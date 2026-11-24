import {
  CalendarDays,
  CheckCircle2,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Settings,
  Sun,
  X,
} from 'lucide-react';
import type { NavSection } from '../types/task';

interface SidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  userName: string;
  userEmail: string;
  onLogout: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  counts: {
    all: number;
    today: number;
    upcoming: number;
    completed: number;
  };
}

const NAV_ITEMS: {
  id: NavSection;
  label: string;
  icon: typeof LayoutDashboard;
  countKey?: keyof SidebarProps['counts'];
}[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'my-tasks', label: 'My Tasks', icon: ListTodo, countKey: 'all' },
  { id: 'today', label: 'Today', icon: Sun, countKey: 'today' },
  { id: 'upcoming', label: 'Upcoming', icon: CalendarDays, countKey: 'upcoming' },
  { id: 'completed', label: 'Completed', icon: CheckCircle2, countKey: 'completed' },
  { id: 'categories', label: 'Categories', icon: FolderKanban },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({
  activeSection,
  onSelectSection,
  userName,
  userEmail,
  onLogout,
  mobileOpen,
  onCloseMobile,
  counts,
}: SidebarProps) {
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'U';

  const handleNavClick = (section: NavSection) => {
    onSelectSection(section);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#FFFFFF] border-r border-[#E5E9E4] w-[248px]">
      <div className="flex items-center justify-between px-5 py-5 border-b border-[#E5E9E4]">
        <button
          type="button"
          onClick={() => handleNavClick('dashboard')}
          className="flex items-center gap-2.5 text-left cursor-pointer"
        >
          <span
            className="w-8 h-8 rounded-lg bg-[#52765D] flex items-center justify-center text-white shrink-0"
            aria-hidden="true"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12l5 5L20 7" />
            </svg>
          </span>
          <span className="font-['Manrope'] text-lg font-bold tracking-tight text-[#252A26] whitespace-nowrap">
            TaskFlow
          </span>
        </button>

        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="lg:hidden p-1.5 text-[#777F78] hover:text-[#252A26] rounded-lg cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav aria-label="Primary navigation" className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          const count = item.countKey ? counts[item.countKey] : undefined;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#EAF1EA] text-[#42634C] font-semibold'
                  : 'text-[#252A26] hover:bg-[#F6F7F4] font-medium'
              }`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-[#52765D]' : 'text-[#777F78]'
                  }`}
                  aria-hidden="true"
                />
                <span className="truncate">{item.label}</span>
              </span>
              {typeof count === 'number' && count > 0 ? (
                <span
                  className={`text-xs tabular-nums ${
                    isActive ? 'text-[#42634C] font-semibold' : 'text-[#777F78]'
                  }`}
                >
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#E5E9E4] space-y-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-lg bg-[#EAF1EA] text-[#42634C] flex items-center justify-center text-xs font-semibold shrink-0"
            aria-hidden="true"
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#252A26] truncate">
              {userName}
            </p>
            <p className="text-xs text-[#777F78] truncate">{userEmail}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-[#777F78] hover:text-[#D65B55] hover:bg-[#FBECEB]/60 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#252A26]/30"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-50 h-full">{sidebarContent}</div>
        </div>
      ) : null}
    </>
  );
}
