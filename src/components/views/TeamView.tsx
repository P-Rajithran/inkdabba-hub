import { useState, useEffect } from 'react'
import type React from 'react'
import {
  Clock,
  AlertTriangle,
  Calendar,
  AlertCircle,
  ShieldAlert,
  UserX,
  Building2,
} from 'lucide-react'
import type { Task, TeamMember, BackendTask, BackendUser, LeaveEntry } from '../../types'
import { fetchTasksFromApi, fetchUsersFromApi, fetchTodayLeaveApi } from '../../services/api'
import { isDueToday, isOverdue, getStatusPillClasses } from '../../utils/taskUtils'
import { getCategoryStyle, type CategoryStyle } from '../../utils/categoryColors'

interface TeamViewProps {
  tasks?: Task[]
  members?: TeamMember[]
}

export const TeamView: React.FC<TeamViewProps> = ({
  tasks: initialTasks = [],
  members: initialMembers = [],
}) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [members, setMembers] = useState<TeamMember[]>(initialMembers)
  const [todayLeaves, setTodayLeaves] = useState<LeaveEntry[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  // Map backend task to frontend Task model
  const mapBackendTask = (bt: BackendTask): Task => {
    let dueFormatted = '05:00 PM'
    if (bt.dueDate) {
      const d = new Date(bt.dueDate)
      dueFormatted = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }

    const resolvedCategory = bt.category || getCategoryStyle(undefined, bt.title).id
    const clientObj = typeof bt.client === 'object' && bt.client ? bt.client : null
    const clientName = clientObj ? clientObj.name : undefined

    return {
      id: bt._id,
      title: bt.title,
      description: bt.description,
      category: resolvedCategory,
      priority: bt.status === 'review' ? 'medium' : bt.status === 'revisions' ? 'urgent' : 'medium',
      status: bt.status,
      dueTime: dueFormatted,
      dueDate: bt.dueDate,
      completed: bt.status === 'completed',
      assignedTo: bt.assignee ? bt.assignee.name : undefined,
      assigneeId: bt.assignee ? bt.assignee._id : undefined,
      client: bt.client,
      clientName,
    }
  }

  // Map backend user to TeamMember
  const mapBackendUser = (u: BackendUser, allTasks: BackendTask[]): TeamMember => {
    const userTasks = allTasks.filter((t) => t.assignee?._id === u._id)
    const activeTasks = userTasks.filter((t) => t.status === 'active').length

    return {
      id: u._id,
      name: u.name,
      role: u.designation || u.role,
      designation: u.designation,
      email: u.email,
      status: 'active',
      tasksCount: activeTasks,
      capacity: Math.min(100, Math.max(25, activeTasks * 30 + 15)),
      avatarInitial: u.name.charAt(0).toUpperCase(),
    }
  }

  // Fetch from GET /api/tasks, GET /api/users, and GET /api/leave/today
  useEffect(() => {
    let isMounted = true

    async function loadTeamData() {
      try {
        setLoading(true)
        const [apiTasks, apiUsers, apiLeaves] = await Promise.all([
          fetchTasksFromApi(),
          fetchUsersFromApi(),
          fetchTodayLeaveApi().catch(() => []),
        ])

        if (!isMounted) return

        if (apiTasks && apiTasks.length > 0) {
          setTasks(apiTasks.map(mapBackendTask))
        }

        if (apiUsers && apiUsers.length > 0) {
          setMembers(apiUsers.map((u) => mapBackendUser(u, apiTasks || [])))
        }

        if (apiLeaves) {
          setTodayLeaves(apiLeaves)
        }
      } catch (err) {
        console.warn('[TeamView] Could not fetch live API data, using props:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadTeamData()

    return () => {
      isMounted = false
    }
  }, [])

  // Format due date & time cleanly
  const formatDueDate = (dueDate?: string | null, dueTime?: string): string => {
    if (dueDate) {
      const d = new Date(dueDate)
      const now = new Date()
      const isToday =
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()

      const timeStr = d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })

      if (isToday) {
        return `Today at ${timeStr}`
      }

      const dateStr = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
      return `${dateStr} at ${timeStr}`
    }

    if (dueTime) {
      return `Today at ${dueTime}`
    }

    return 'No due date'
  }

  // Top summary bar counts across ALL users
  const totalActive = tasks.filter((t) => t.status === 'active' && !t.completed).length
  const inReview = tasks.filter((t) => t.status === 'review' && !t.completed).length
  const dueToday = tasks.filter((t) => isDueToday(t) && t.status !== 'completed').length
  const overdue = tasks.filter((t) => isOverdue(t)).length

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#1A1A1A]">
              Team View
            </h1>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6862] bg-[#EFECE6] px-2 py-0.5 rounded">
              Read-Only
            </span>
          </div>
          <p className="text-xs lg:text-sm text-[#6B6862]">
            Live operational workload and task distribution across all studio operators
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 text-xs text-[#57534E] bg-white border border-[#E8E5DD] px-3 py-1.5 rounded-xl shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span>{loading ? 'Refreshing...' : 'Live MongoDB Feed'}</span>
          </span>
        </div>
      </div>

      {/* Top Summary Bar: Total Active / In-Review / Due-Today / Overdue */}
      <div className="bg-white border-2 border-[#E8E5DD] rounded-3xl p-6 lg:p-7 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 divide-y lg:divide-y-0 lg:divide-x divide-[#E8E5DD]">
          {/* Total Active */}
          <div className="flex flex-col justify-between pt-4 lg:pt-0 lg:px-4 first:pt-0 first:px-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#1E3558]">
                Total Active
              </span>
              <Clock className="w-4 h-4 text-[#2B4C7E]" />
            </div>
            <div className="my-3 text-3xl lg:text-4xl font-black text-[#1E3558]">
              {totalActive}
            </div>
            <div className="text-xs font-semibold text-[#57534E]">
              Running in studio floor
            </div>
          </div>

          {/* In-Review */}
          <div className="flex flex-col justify-between pt-4 lg:pt-0 lg:px-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-950">
                In-Review
              </span>
              <AlertCircle className="w-4 h-4 text-amber-700" />
            </div>
            <div className="my-3 text-3xl lg:text-4xl font-black text-amber-950">
              {inReview}
            </div>
            <div className="text-xs font-semibold text-[#57534E]">
              Awaiting QA or proofing
            </div>
          </div>

          {/* Due-Today */}
          <div className="flex flex-col justify-between pt-4 lg:pt-0 lg:px-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#1A1A1A]">
                Due Today
              </span>
              <Calendar className="w-4 h-4 text-[#1A1A1A]" />
            </div>
            <div className="my-3 text-3xl lg:text-4xl font-black text-[#1A1A1A]">
              {dueToday}
            </div>
            <div className="text-xs font-semibold text-[#57534E]">
              Scheduled for current shift
            </div>
          </div>

          {/* Overdue */}
          <div className="flex flex-col justify-between pt-4 lg:pt-0 lg:px-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-rose-950">
                Overdue
              </span>
              <AlertTriangle className="w-4 h-4 text-rose-700" />
            </div>
            <div className="my-3 text-3xl lg:text-4xl font-black text-rose-950">
              {overdue}
            </div>
            <div className="text-xs font-bold text-rose-900">
              {overdue > 0 ? 'Requires immediate action' : 'All jobs on schedule'}
            </div>
          </div>
        </div>
      </div>

      {/* List Grouped by Person */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1A1A1A]">
            Operators & Task Allocation ({members.length})
          </h2>
          <span className="text-xs text-[#8C827A]">
            Showing {tasks.length} total tasks across team
          </span>
        </div>

        <div className="space-y-6">
          {members.map((member) => {
            // Find tasks assigned to this member
            const memberTasks = tasks.filter((t) => {
              if (t.assigneeId && t.assigneeId === member.id) return true
              if (t.assignedTo && t.assignedTo.toLowerCase() === member.name.toLowerCase()) return true
              return false
            })

            // Active tasks (not completed)
            const activeMemberTasks = memberTasks.filter((t) => t.status !== 'completed')

            // Extract unique categories they're actively working in
            const activeCategoriesMap = new Map<string, CategoryStyle>()
            for (const task of activeMemberTasks) {
              const catStyle = getCategoryStyle(task.category, task.title)
              if (!activeCategoriesMap.has(catStyle.id)) {
                activeCategoriesMap.set(catStyle.id, catStyle)
              }
            }
            const activeCategories = Array.from(activeCategoriesMap.values())

            const memberActiveCount = activeMemberTasks.filter((t) => t.status === 'active').length
            const memberOverdueCount = memberTasks.filter((t) => isOverdue(t)).length

            // Check if person has a leave entry for today
            const personLeave = todayLeaves.find((l) => {
              const uId =
                typeof l.user === 'object' && l.user
                  ? l.user._id
                  : (l.user || l.userId)
              return (
                uId === member.id ||
                (typeof l.user === 'object' && l.user?.name === member.name)
              )
            })

            const isFullLeave = personLeave?.type === 'full'
            const isHalfLeave = personLeave?.type === 'half'

            return (
              <div
                key={member.id}
                className={`bg-white border-2 border-[#E8E5DD] rounded-3xl p-6 lg:p-8 shadow-xs space-y-6 relative overflow-hidden transition-all ${
                  isFullLeave ? 'grayscale opacity-60' : ''
                }`}
              >
                {/* Half-Day Split Overlay:
                    Left half normal colorful, right half grayscale, with a thin animated highlight line
                    that slowly sweeps left-to-right across the divider on a continuous loop */}
                {isHalfLeave && (
                  <>
                    <div
                      className="absolute inset-y-0 right-0 w-1/2 pointer-events-none z-10"
                      style={{
                        backdropFilter: 'grayscale(100%) contrast(92%)',
                        WebkitBackdropFilter: 'grayscale(100%) contrast(92%)',
                        backgroundColor: 'rgba(238, 235, 228, 0.12)',
                      }}
                    />
                    <div className="absolute inset-y-0 left-1/2 w-px bg-stone-300/80 pointer-events-none z-20" />
                    <div className="absolute inset-y-0 left-1/2 pointer-events-none z-30 flex items-center justify-center">
                      <div className="w-[3px] h-full bg-linear-to-b from-transparent via-[#2B4C7E] to-transparent shadow-[0_0_12px_#2B4C7E] animate-sweep-divider" />
                    </div>
                  </>
                )}

                {/* Person Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F0EDE6] relative z-20">
                  {/* Left: Avatar, Name, Role, Email, Category Dots, Badges */}
                  <div className="flex items-center gap-4">
                    <div className="w-13 h-13 rounded-2xl bg-[#2B4C7E] text-white flex items-center justify-center font-black text-lg shadow-xs shrink-0 ring-2 ring-white">
                      {member.avatarInitial || member.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        {/* High-Contrast Employee Name: Solid #1A1A1A on light background */}
                        <h3 className="text-xl font-black text-[#1A1A1A] tracking-tight leading-tight">
                          {member.name}
                        </h3>

                        {/* Category Dots: small colored dots for categories actively working in */}
                        {activeCategories.length > 0 && (
                          <div
                            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#F5F2EB] border border-[#DDD8CE] shadow-2xs shrink-0"
                            title={`Actively working in: ${activeCategories.map((c) => c.label).join(', ')}`}
                          >
                            {activeCategories.map((cat) => (
                              <span
                                key={cat.id}
                                className={`w-2.5 h-2.5 rounded-full ${cat.dotClass} ring-1 ring-white shrink-0 shadow-2xs`}
                                title={`Active in ${cat.label}`}
                              />
                            ))}
                            <span className="text-[10px] font-mono font-bold text-[#44403C] ml-0.5">
                              {activeCategories.length}
                            </span>
                          </div>
                        )}

                        {/* Full Day: Pulsing "away" badge with icon + subtle fade in/out animation */}
                        {isFullLeave && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-900 border border-stone-300 text-xs font-bold animate-pulse-subtle shadow-xs">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                            </span>
                            <UserX className="w-3.5 h-3.5 text-stone-700" />
                            <span>Away</span>
                          </div>
                        )}

                        {/* Half Day Badge */}
                        {isHalfLeave && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF1F8] text-[#1E3558] border border-[#C7D9EC] text-xs font-bold shadow-2xs">
                            <Clock className="w-3.5 h-3.5 text-[#2B4C7E]" />
                            <span>Half Day</span>
                          </div>
                        )}

                        {memberOverdueCount > 0 && !isFullLeave && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase text-rose-950 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-300">
                            <ShieldAlert className="w-3 h-3 text-rose-700" />
                            {memberOverdueCount} Overdue
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-[#44403C] truncate mt-1">
                        {member.role} {member.email && `• ${member.email}`}
                      </p>
                    </div>
                  </div>

                  {/* Right: Active task count badge & status */}
                  <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
                    <span
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                        memberActiveCount > 0
                          ? 'bg-[#EBF1F8] text-[#1E3558] border-[#C7D9EC]'
                          : 'bg-[#F2EFE8] text-[#57534E] border-[#E5E1D8]'
                      }`}
                    >
                      {memberActiveCount} Active {memberActiveCount === 1 ? 'Task' : 'Tasks'}
                    </span>
                    <span className="text-xs font-semibold text-[#57534E]">
                      ({memberTasks.length} assigned total)
                    </span>
                  </div>
                </div>

                {/* Person's Tasks List */}
                <div className="space-y-3 relative z-20">
                  {memberTasks.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {memberTasks.map((task) => {
                        const overdueTask = isOverdue(task)
                        const { badgeClass, label: pillLabel } = getStatusPillClasses(
                          task.status,
                          overdueTask
                        )
                        const catStyle = getCategoryStyle(task.category, task.title)

                        return (
                          <div
                            key={task.id}
                            className={`p-4 rounded-2xl border transition-all ${catStyle.borderLeftClass} ${
                              overdueTask
                                ? 'bg-rose-50/50 border-rose-300'
                                : 'bg-[#F7F5F1] border-[#E8E5DD] hover:border-[#2B4C7E]/40'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              {/* Left details: Title, description, status pill, category tag */}
                              <div className="space-y-1.5 min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  {/* Category Tag based on design spec */}
                                  <span
                                    className={`inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${catStyle.tagBadgeClass}`}
                                  >
                                    <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dotClass}`} />
                                    {catStyle.label}
                                  </span>

                                  {/* Client Badge */}
                                  {task.clientName && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1E3558] bg-[#EBF1F8] border border-[#C7D9EC] px-2 py-0.5 rounded-md">
                                      <Building2 className="w-3 h-3 text-[#2B4C7E]" />
                                      {task.clientName}
                                    </span>
                                  )}

                                  {/* Semantic Status Pill: green=done, amber=review, red=overdue */}
                                  <span
                                    className={`text-[11px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-md border ${badgeClass}`}
                                  >
                                    {pillLabel}
                                  </span>

                                  {/* Overdue visually flagged (color + icon) */}
                                  {overdueTask && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-300">
                                      <AlertTriangle className="w-3 h-3 text-rose-700" />
                                      Overdue
                                    </span>
                                  )}

                                  <span
                                    className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                      task.priority === 'urgent'
                                        ? 'bg-rose-100 text-rose-900 border border-rose-200'
                                        : 'bg-[#EAE6DD] text-[#44403C]'
                                    }`}
                                  >
                                    {task.priority}
                                  </span>
                                </div>

                                <h4
                                  className={`text-sm font-bold text-[#1A1A1A] leading-snug ${
                                    task.status === 'completed'
                                      ? 'line-through text-[#78716C]'
                                      : ''
                                  }`}
                                >
                                  {task.title}
                                </h4>

                                {task.description && (
                                  <p className="text-xs font-medium text-[#44403C] leading-relaxed">
                                    {task.description}
                                  </p>
                                )}
                              </div>

                              {/* Right details: Due date */}
                              <div className="shrink-0 sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E8E5DD]">
                                <div
                                  className={`text-xs font-mono flex sm:justify-end items-center gap-1.5 ${
                                    overdueTask
                                      ? 'text-rose-900 font-bold'
                                      : 'text-[#292524] font-semibold'
                                  }`}
                                >
                                  <Clock
                                    className={`w-3.5 h-3.5 ${
                                      overdueTask ? 'text-rose-700' : 'text-[#57534E]'
                                    }`}
                                  />
                                  <span>{formatDueDate(task.dueDate, task.dueTime)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl bg-[#F7F5F1] border border-dashed border-[#DCD7CD] text-center text-[#57534E] text-xs">
                      <img
                        src="/hi.png"
                        alt="All clear"
                        className="h-24 w-auto object-contain mx-auto mb-2 drop-shadow-sm"
                      />
                      <p className="font-bold text-[#1A1A1A] text-sm">
                        All clear! Nothing on their plate right now
                      </p>
                      <p className="mt-0.5 text-[#57534E]">
                        Available for incoming creative briefs, campaigns, and dev sprints.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
