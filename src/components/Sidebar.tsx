import {
  CalendarDays,
  LayoutDashboard,
  CheckSquare,
  Users,
  CheckCircle2,
  Tv,
  X,
  LogOut,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { NavItemId, TeamMember } from '../types'

interface SidebarProps {
  currentView: NavItemId
  currentUser?: TeamMember
  onSelectView: (view: NavItemId) => void
  onLogout?: () => void
  isOpen: boolean
  onClose: () => void
  taskCount?: number
}

interface NavItem {
  id: NavItemId
  label: string
  icon: LucideIcon
  badge?: string | number
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  currentUser,
  onSelectView,
  onLogout,
  isOpen,
  onClose,
  taskCount = 0,
}) => {
  const navItems: NavItem[] = [
    { id: 'today', label: 'Today', icon: CalendarDays },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'my-tasks',
      label: 'My Tasks',
      icon: CheckSquare,
      badge: taskCount && taskCount > 0 ? taskCount : undefined,
    },
    { id: 'team-view', label: 'Team View', icon: Users },
    { id: 'completed-tasks', label: 'Completed Tasks', icon: CheckCircle2 },
    { id: 'tv-mode', label: 'TV Mode', icon: Tv, badge: 'LIVE' },
  ]

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#1A1A1A]/30 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 h-screen z-50
          w-64 lg:w-72 shrink-0
          bg-[#F7F5F1] border-r border-[#E8E5DD]
          flex flex-col justify-between
          transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Top Section: Brand & Nav */}
        <div className="flex flex-col px-6 pt-7 pb-4">
          {/* Logo & Close button */}
          <div className="flex items-center justify-between mb-9">
            <div className="flex items-center gap-3.5 group cursor-pointer" onClick={() => onSelectView('dashboard')}>
              {/* Logo Mark "ID" */}
              <div className="w-10 h-10 rounded-xl bg-[#2B4C7E] flex items-center justify-center text-[#F7F5F1] font-bold text-base tracking-tight shadow-sm ring-1 ring-[#2B4C7E]/10">
                ID
              </div>

              {/* Title & Hub tag */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-lg text-[#1A1A1A] tracking-tight">
                    inkdabba
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#2B4C7E] bg-[#EBF1F8] px-1.5 py-0.5 rounded">
                    hub
                  </span>
                </div>
                <span className="text-xs text-[#6B6862] font-normal">
                  Production & Studio
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg text-[#6B6862] hover:text-[#1A1A1A] hover:bg-[#EFECE6] transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Section */}
          <div className="space-y-1">
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-widest text-[#969188]">
              Workspace
            </p>

            <nav className="space-y-1.5" aria-label="Main Navigation">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = currentView === item.id

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectView(item.id)
                      onClose()
                    }}
                    className={`
                      w-full flex items-center justify-between
                      px-3.5 py-3 rounded-xl text-sm font-medium
                      transition-all duration-150 group
                      ${
                        isActive
                          ? 'bg-[#2B4C7E] text-white shadow-sm ring-1 ring-[#2B4C7E]'
                          : 'text-[#1A1A1A] hover:bg-[#EFECE6] hover:text-[#1A1A1A]'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-white'
                            : 'text-[#6B6862] group-hover:text-[#1A1A1A]'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`
                          text-xs font-semibold px-2 py-0.5 rounded-full shrink-0
                          ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : item.id === 'tv-mode'
                              ? 'bg-[#2B4C7E]/10 text-[#2B4C7E]'
                              : 'bg-[#E8E5DD] text-[#57534E]'
                          }
                        `}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Section: Status & Workspace Profile */}
        <div className="px-6 py-6 border-t border-[#E8E5DD] flex flex-col gap-4">
          {/* Status Indicator */}
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#EFECE6]/70 text-xs">
            <div className="flex items-center gap-2 text-[#57534E]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span>Hub Connected</span>
            </div>
            <span className="font-mono text-[11px] text-[#8C827A]">v1.0.4</span>
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#E8E5DD] text-[#2B4C7E] flex items-center justify-center font-bold text-sm ring-2 ring-white shrink-0">
                {currentUser?.avatarInitial || currentUser?.name?.charAt(0) || 'A'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-[#1A1A1A] truncate leading-tight">
                  {currentUser?.name || 'Aswin'}
                </span>
                <span className="text-xs text-[#6B6862] truncate leading-tight mt-0.5 capitalize">
                  {currentUser?.role || 'Member'}
                </span>
              </div>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg text-[#8C827A] hover:text-rose-700 hover:bg-rose-50 transition-colors shrink-0"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
