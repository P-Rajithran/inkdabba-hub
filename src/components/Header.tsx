import { useState, useRef, useEffect } from 'react'
import type React from 'react'
import { Menu, Plus, Bell } from 'lucide-react'
import type { NavItemId, TeamMember } from '../types'

interface HeaderProps {
  currentView: NavItemId
  currentUser?: TeamMember
  teamMembers?: TeamMember[]
  onSelectUser?: (user: TeamMember) => void
  onOpenMobileMenu: () => void
  onNewTaskClick: () => void
}

const VIEW_TITLES: Record<NavItemId, { title: string; subtitle: string }> = {
  today: {
    title: 'Today',
    subtitle: 'Daily operational priorities, active deliverables, and shift logs',
  },
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Executive agency intelligence, department pipelines, and client accounts',
  },
  'my-tasks': {
    title: 'My Tasks',
    subtitle: 'Your personal deliverables queue and stage reviews',
  },
  'team-view': {
    title: 'Team View',
    subtitle: 'Agency specialists, leave calendar, and workload capacity balance',
  },
  spotlight: {
    title: 'Spotlight & Leaderboard',
    subtitle: 'Top specialist output milestones and studio rankings',
  },
  'completed-tasks': {
    title: 'Completed Tasks',
    subtitle: 'Archive of delivered campaigns, deployed features, and signed-off assets',
  },
  'tv-mode': {
    title: 'TV Mode',
    subtitle: 'High-visibility broadcast monitor for office screens',
  },
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  currentUser,
  teamMembers,
  onSelectUser,
  onOpenMobileMenu,
  onNewTaskClick,
}) => {
  const { title, subtitle } = VIEW_TITLES[currentView]

  // Formatted date
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })

  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false)
  const notificationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false)
      }
    }
    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isNotificationsOpen])

  return (
    <header className="sticky top-0 z-30 bg-[#F7F5F1]/90 backdrop-blur-md border-b border-[#E8E5DD] px-6 lg:px-12 py-5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Mobile trigger & Titles */}
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-[#1A1A1A] hover:bg-[#EFECE6] transition-colors shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#1A1A1A] truncate">
                {title}
              </h1>
              <span className="hidden sm:inline-block text-xs font-mono text-[#8C827A] border-l border-[#DCD7CD] pl-3 py-0.5">
                {today}
              </span>
            </div>
            <p className="text-xs lg:text-sm text-[#6B6862] font-normal truncate mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser && teamMembers && onSelectUser && (
            <div className="hidden sm:flex items-center gap-2 bg-[#EFECE6] px-3 py-1.5 rounded-xl text-xs border border-[#E0DCD3]">
              <span className="text-[11px] font-bold text-[#57534E]">Viewing as:</span>
              <span className="w-6 h-6 rounded-full bg-[#2B4C7E] text-white flex items-center justify-center font-bold text-[10px]">
                {currentUser.avatarInitial || currentUser.name.charAt(0)}
              </span>
              <select
                value={currentUser.id}
                onChange={(e) => {
                  const u = teamMembers.find((m) => m.id === e.target.value)
                  if (u) onSelectUser(u)
                }}
                className="bg-transparent font-semibold text-[#1A1A1A] focus:outline-hidden cursor-pointer"
                title="Viewing as team member"
              >
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Notification Bell with hi.png Empty State */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2.5 rounded-xl border border-[#E0DCD3] bg-white hover:bg-[#F2EFE8] text-[#1A1A1A] transition-colors relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-[#2B4C7E]" />
              <span className="sr-only">Notifications</span>
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white border-2 border-[#E8E5DD] shadow-lg p-5 z-50 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-[#F0EDE6] mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-[#1A1A1A]">
                    Notifications
                  </span>
                  <span className="text-[10px] font-bold text-[#8C827A]">0 unread</span>
                </div>

                {/* Empty Notifications state with hi.png */}
                <div className="text-center py-2">
                  <img
                    src="/hi.png"
                    alt="All clear"
                    className="h-24 w-auto object-contain mx-auto mb-2 drop-shadow-sm"
                  />
                  <p className="text-sm font-bold text-[#1A1A1A]">
                    All clear! Nothing on your plate right now
                  </p>
                  <p className="text-xs text-[#57534E] mt-1 max-w-xs mx-auto">
                    You're completely up to date. No new campaign alerts, reviews, or approvals.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Action Button */}
          <button
            onClick={onNewTaskClick}
            className="inline-flex items-center gap-2 bg-[#2B4C7E] hover:bg-[#213C64] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 shadow-sm active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Task</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>
    </header>
  )
}
