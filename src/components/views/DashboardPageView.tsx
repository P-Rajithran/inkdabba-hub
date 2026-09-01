import { useState, useEffect, useCallback } from 'react'
import type React from 'react'
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  Plus,
  LogOut,
  Calendar,
  User,
  ShieldCheck,
  Search,
  Filter,
} from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import type { Task, TaskStatus, TeamMember, BackendTask, BackendUser } from '../../types'
import {
  fetchMyTasksFromApi,
  fetchTasksFromApi,
  fetchUsersFromApi,
  createTaskApi,
  updateTaskStatusApi,
} from '../../services/api'
import { isOverdue, getStatusPillClasses, calculateMyTaskStats } from '../../utils/taskUtils'

export const DashboardPageView: React.FC = () => {
  const { currentUser: authUser, logout } = useAuth()

  // State for user's own tasks (GET /api/tasks/mine)
  const [myTasks, setMyTasks] = useState<Task[]>([])

  // State for all tasks (GET /api/tasks - Admin only)
  const [allTasks, setAllTasks] = useState<Task[]>([])

  // Admin tab toggle: 'mine' vs 'everyone'
  const [adminTab, setAdminTab] = useState<'mine' | 'everyone'>('mine')

  // Team members list for assignee dropdown
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])

  // Loading & status states
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all')

  // Quick-add state
  const [quickTitle, setQuickTitle] = useState('')
  const [quickDescription, setQuickDescription] = useState('')
  const [quickCategory, setQuickCategory] = useState('Design')
  const [quickPriority, setQuickPriority] = useState<'urgent' | 'medium' | 'low'>('medium')
  const [quickAssigneeId, setQuickAssigneeId] = useState<string>('')
  const [quickDueTime, setQuickDueTime] = useState('05:00 PM')
  const [showQuickOptions, setShowQuickOptions] = useState(false)
  const [isSubmittingTask, setIsSubmittingTask] = useState(false)

  const isAdmin = authUser?.role === 'admin'

  // Map backend task to frontend format
  const mapBackendTask = useCallback((bt: BackendTask): Task => {
    let dueFormatted = '05:00 PM'
    if (bt.dueDate) {
      const d = new Date(bt.dueDate)
      dueFormatted = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }

    return {
      id: bt._id,
      title: bt.title,
      description: bt.description,
      category: bt.category || 'Design',
      priority: bt.status === 'review' ? 'medium' : bt.status === 'revisions' ? 'urgent' : 'medium',
      status: bt.status,
      dueTime: dueFormatted,
      dueDate: bt.dueDate,
      completed: bt.status === 'completed',
      assignedTo: bt.assignee ? bt.assignee.name : undefined,
      assigneeId: bt.assignee ? bt.assignee._id : undefined,
    }
  }, [])

  // Load tasks and users
  const loadDashboardData = useCallback(async () => {
    try {
      // 1. Always fetch user's own tasks (GET /api/tasks/mine)
      const mineData = await fetchMyTasksFromApi()
      const mappedMine = mineData.map(mapBackendTask)
      setMyTasks(mappedMine)

      // 2. If user is admin, also fetch all tasks (GET /api/tasks)
      if (isAdmin) {
        try {
          const everyoneData = await fetchTasksFromApi()
          setAllTasks(everyoneData.map(mapBackendTask))
        } catch (adminErr) {
          console.warn('Admin tasks fetch error:', adminErr)
        }
      }

      // 3. Fetch users for assignee selector
      try {
        const users = await fetchUsersFromApi()
        const mappedUsers: TeamMember[] = users.map((u: BackendUser) => ({
          id: u._id,
          name: u.name,
          role: u.role,
          email: u.email,
          status: 'active',
          tasksCount: 0,
          capacity: 50,
          avatarInitial: u.name.charAt(0).toUpperCase(),
        }))
        setTeamMembers(mappedUsers)

        if (authUser?.id) {
          setQuickAssigneeId(authUser.id)
        } else if (mappedUsers.length > 0) {
          setQuickAssigneeId(mappedUsers[0].id)
        }
      } catch (userErr) {
        console.warn('Users fetch error:', userErr)
      }
    } catch (err) {
      console.error('Failed to load dashboard tasks:', err)
    } finally {
      setIsLoading(false)
    }
  }, [isAdmin, authUser, mapBackendTask])

  useEffect(() => {
    let ignore = false

    async function init() {
      try {
        const mineData = await fetchMyTasksFromApi()
        if (ignore) return
        setMyTasks(mineData.map(mapBackendTask))

        if (isAdmin) {
          try {
            const everyoneData = await fetchTasksFromApi()
            if (!ignore) setAllTasks(everyoneData.map(mapBackendTask))
          } catch (adminErr) {
            console.warn('Admin tasks fetch error:', adminErr)
          }
        }

        try {
          const users = await fetchUsersFromApi()
          if (!ignore) {
            const mappedUsers: TeamMember[] = users.map((u: BackendUser) => ({
              id: u._id,
              name: u.name,
              role: u.role,
              email: u.email,
              status: 'active',
              tasksCount: 0,
              capacity: 50,
              avatarInitial: u.name.charAt(0).toUpperCase(),
            }))
            setTeamMembers(mappedUsers)
            if (authUser?.id) {
              setQuickAssigneeId(authUser.id)
            } else if (mappedUsers.length > 0) {
              setQuickAssigneeId(mappedUsers[0].id)
            }
          }
        } catch (userErr) {
          console.warn('Users fetch error:', userErr)
        }
      } catch (err) {
        console.error('Failed to initialize dashboard tasks:', err)
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    init()

    return () => {
      ignore = true
    }
  }, [isAdmin, authUser?.id, mapBackendTask])

  // Four stat cards computed strictly from the user's OWN tasks
  const { total, done, active, overdue } = calculateMyTaskStats(myTasks)

  // Quick-add submission (POST /api/tasks)
  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickTitle.trim()) return

    try {
      setIsSubmittingTask(true)

      const payload: {
        title: string
        description?: string
        status?: TaskStatus
        dueDate?: string
        assignee?: string | null
      } = {
        title: quickTitle.trim(),
        description: quickDescription.trim() || undefined,
        status: 'active',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString(), // 5 hours from now
      }

      // If admin and an assignee is selected, specify it; otherwise let backend default to req.userId
      if (isAdmin && quickAssigneeId) {
        payload.assignee = quickAssigneeId
      }

      const created = await createTaskApi(payload)
      const mapped = mapBackendTask(created)
      mapped.category = quickCategory
      mapped.priority = quickPriority
      mapped.dueTime = quickDueTime

      // Update local state immediately
      setMyTasks((prev) => [mapped, ...prev])
      if (isAdmin) {
        setAllTasks((prev) => [mapped, ...prev])
      }

      // Reset input
      setQuickTitle('')
      setQuickDescription('')
      setShowQuickOptions(false)
    } catch (err) {
      console.error('Failed to add task:', err)
      alert(err instanceof Error ? err.message : 'Failed to add task')
    } finally {
      setIsSubmittingTask(false)
    }
  }

  // Handle status update (PATCH /api/tasks/:id/status)
  const handleStatusUpdate = async (taskId: string, newStatus: TaskStatus) => {
    const timeStr = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })

    // Optimistic UI update
    const updateInList = (list: Task[]) =>
      list.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: newStatus,
              completed: newStatus === 'completed',
              completedAt: newStatus === 'completed' ? timeStr : undefined,
            }
          : t
      )

    setMyTasks(updateInList)
    if (isAdmin) {
      setAllTasks(updateInList)
    }

    try {
      await updateTaskStatusApi(taskId, newStatus)
    } catch (err) {
      console.error('Status update failed:', err)
      // Revert if error
      loadDashboardData()
    }
  }

  // Active task dataset based on admin tab
  const activeDataset = isAdmin && adminTab === 'everyone' ? allTasks : myTasks

  // Search and status filter
  const filteredTasks = activeDataset.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.assignedTo && t.assignedTo.toLowerCase().includes(q))
      )
    }
    return true
  })

  // Formatted date string
  const todayDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Greeting Header with User's Name and Logout Button */}
      <div className="bg-white border border-[#E8E5DD] rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A1A1A]">
                Good day, {authUser?.name || 'Operator'}
              </h1>

              {/* Role badge */}
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  isAdmin
                    ? 'bg-[#EBF1F8] text-[#2B4C7E] border-[#C7D9EC]'
                    : 'bg-[#F2EFE8] text-[#57534E] border-[#E5E1D8]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#2B4C7E]" />
                {authUser?.role || 'member'}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#6B6862] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#8C827A]" />
              <span>{todayDateString}</span>
              <span>•</span>
              <span>Inkdabba Production Hub</span>
            </p>
          </div>

          {/* Right Action: Logout Button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E8E5DD] bg-[#F7F5F1] hover:bg-rose-50 hover:border-rose-200 hover:text-rose-800 text-xs font-bold text-[#57534E] transition-all cursor-pointer shadow-2xs"
              title="Sign out of inkdabba-hub"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Four Stat Cards (Total, Done, Active, Overdue) Computed from Their Own Tasks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#6B6862]">
            My Shift Performance (Your Tasks)
          </h2>
          <span className="text-[11px] text-[#8C827A]">
            Filtered strictly to {authUser?.name || 'your'} assigned work
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Total */}
          <div className="bg-white border border-[#E8E5DD] rounded-2xl p-5 sm:p-6 shadow-xs hover:border-[#D4DFEE] transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B6862]">
                Total
              </span>
              <Layers className="w-4 h-4 text-[#8C827A]" />
            </div>
            <div className="my-2.5 text-3xl sm:text-4xl font-extrabold text-[#1A1A1A]">
              {total}
            </div>
            <div className="text-xs text-[#8C827A]">Assigned to your queue</div>
          </div>

          {/* Card 2: Done (Green) */}
          <div className="bg-white border border-[#E8E5DD] rounded-2xl p-5 sm:p-6 shadow-xs hover:border-emerald-200 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Done
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="my-2.5 text-3xl sm:text-4xl font-extrabold text-emerald-900">
              {done}
            </div>
            <div className="text-xs text-emerald-700 font-medium">
              {total > 0 ? `${Math.round((done / total) * 100)}% completed` : '0 completed'}
            </div>
          </div>

          {/* Card 3: Active (Blue) */}
          <div className="bg-white border border-[#E8E5DD] rounded-2xl p-5 sm:p-6 shadow-xs hover:border-[#C7D9EC] transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2B4C7E]">
                Active
              </span>
              <Clock className="w-4 h-4 text-[#2B4C7E]" />
            </div>
            <div className="my-2.5 text-3xl sm:text-4xl font-extrabold text-[#2B4C7E]">
              {active}
            </div>
            <div className="text-xs text-[#57729E] font-medium">In current workflow</div>
          </div>

          {/* Card 4: Overdue (Red) */}
          <div
            className={`border rounded-2xl p-5 sm:p-6 shadow-xs transition-all flex flex-col justify-between ${
              overdue > 0
                ? 'bg-rose-50/40 border-rose-200'
                : 'bg-white border-[#E8E5DD] hover:border-rose-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  overdue > 0 ? 'text-rose-800' : 'text-[#6B6862]'
                }`}
              >
                Overdue
              </span>
              <AlertTriangle
                className={`w-4 h-4 ${overdue > 0 ? 'text-rose-600' : 'text-[#8C827A]'}`}
              />
            </div>
            <div
              className={`my-2.5 text-3xl sm:text-4xl font-extrabold ${
                overdue > 0 ? 'text-rose-800' : 'text-[#1A1A1A]'
              }`}
            >
              {overdue}
            </div>
            <div
              className={`text-xs font-medium ${
                overdue > 0 ? 'text-rose-700' : 'text-[#8C827A]'
              }`}
            >
              {overdue > 0 ? 'Requires immediate action' : 'All tasks on schedule'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Quick-Add Task Input (POSTs to /api/tasks) */}
      <div className="bg-white border border-[#2B4C7E]/30 rounded-2xl p-5 shadow-xs transition-all">
        <form onSubmit={handleQuickAdd} className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="+ Quick-add task for today... (e.g. Calibrate Heidelberg ink rollers, press Enter)"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              className="flex-1 px-4 py-3 bg-[#F7F5F1] border border-[#E8E5DD] rounded-xl text-sm text-[#1A1A1A] placeholder-[#8C827A] focus:outline-hidden focus:border-[#2B4C7E] focus:bg-white transition-colors"
            />

            <button
              type="submit"
              disabled={!quickTitle.trim() || isSubmittingTask}
              className="px-5 py-3 bg-[#2B4C7E] disabled:opacity-40 text-white rounded-xl text-xs font-bold hover:bg-[#213C64] transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmittingTask ? 'Adding...' : 'Add Task'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowQuickOptions(!showQuickOptions)}
              className="px-3.5 py-3 rounded-xl border border-[#E8E5DD] hover:bg-[#F7F5F1] text-xs font-semibold text-[#6B6862] shrink-0 transition-colors cursor-pointer"
            >
              {showQuickOptions ? 'Simple' : 'Options'}
            </button>
          </div>

          {/* Expandable Options for Quick-Add */}
          {showQuickOptions && (
            <div className="pt-3 border-t border-[#F0EDE6] grid grid-cols-1 sm:grid-cols-4 gap-3 animate-fade-in">
              <input
                type="text"
                placeholder="Description (optional)..."
                value={quickDescription}
                onChange={(e) => setQuickDescription(e.target.value)}
                className="px-3 py-2 bg-[#F7F5F1] border border-[#E8E5DD] rounded-xl text-xs text-[#1A1A1A] placeholder-[#8C827A] focus:outline-hidden focus:border-[#2B4C7E]"
              />

              <select
                value={quickCategory}
                onChange={(e) => setQuickCategory(e.target.value)}
                className="px-3 py-2 bg-[#F7F5F1] border border-[#E8E5DD] rounded-xl text-xs text-[#1A1A1A] focus:outline-hidden focus:border-[#2B4C7E]"
              >
                <option value="Design">Category: Design</option>
                <option value="Social">Category: Social</option>
                <option value="Shoot">Category: Shoot</option>
                <option value="Video">Category: Video</option>
                <option value="Ads">Category: Ads</option>
                <option value="Meeting">Category: Meeting</option>
                <option value="Web Dev">Category: Web Dev</option>
                <option value="App Dev">Category: App Dev</option>
              </select>

              <select
                value={quickPriority}
                onChange={(e) => setQuickPriority(e.target.value as 'urgent' | 'medium' | 'low')}
                className="px-3 py-2 bg-[#F7F5F1] border border-[#E8E5DD] rounded-xl text-xs text-[#1A1A1A] focus:outline-hidden focus:border-[#2B4C7E]"
              >
                <option value="urgent">Priority: Urgent</option>
                <option value="medium">Priority: Medium</option>
                <option value="low">Priority: Low</option>
              </select>

              {/* If admin, can choose assignee! */}
              {isAdmin ? (
                <select
                  value={quickAssigneeId}
                  onChange={(e) => setQuickAssigneeId(e.target.value)}
                  className="px-3 py-2 bg-[#F7F5F1] border border-[#2B4C7E]/40 rounded-xl text-xs text-[#1A1A1A] font-semibold focus:outline-hidden focus:border-[#2B4C7E]"
                  title="Assignee (Admin Override)"
                >
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      Assign: {m.name} {m.id === authUser?.id ? '(You)' : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={quickDueTime}
                  onChange={(e) => setQuickDueTime(e.target.value)}
                  placeholder="Due Time (05:00 PM)"
                  className="px-3 py-2 bg-[#F7F5F1] border border-[#E8E5DD] rounded-xl text-xs text-[#1A1A1A] placeholder-[#8C827A] focus:outline-hidden focus:border-[#2B4C7E]"
                />
              )}
            </div>
          )}
        </form>
      </div>

      {/* 4. Admin Tab Toggle (My Tasks vs Everyone's Tasks) & Search/Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left: Tab Toggle if Admin, or simple title if Member */}
          {isAdmin ? (
            <div className="flex items-center gap-1.5 p-1 bg-[#EFECE6] rounded-xl self-start">
              <button
                onClick={() => setAdminTab('mine')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  adminTab === 'mine'
                    ? 'bg-white text-[#2B4C7E] shadow-xs'
                    : 'text-[#6B6862] hover:text-[#1A1A1A]'
                }`}
              >
                My Tasks ({myTasks.length})
              </button>

              <button
                onClick={() => setAdminTab('everyone')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  adminTab === 'everyone'
                    ? 'bg-white text-[#2B4C7E] shadow-xs'
                    : 'text-[#6B6862] hover:text-[#1A1A1A]'
                }`}
              >
                Everyone's Tasks ({allTasks.length})
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-[#1A1A1A]">My Tasks</h2>
              <p className="text-xs text-[#6B6862]">
                Your personal assignments and press floor responsibilities
              </p>
            </div>
          )}

          {/* Right: Search input & Status Quick Filter */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#8C827A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3.5 py-1.5 bg-white border border-[#E8E5DD] rounded-xl text-xs text-[#1A1A1A] placeholder-[#8C827A] focus:outline-hidden focus:border-[#2B4C7E] w-44 sm:w-56"
              />
            </div>

            <div className="flex items-center gap-1 bg-white border border-[#E8E5DD] px-2 py-1 rounded-xl text-xs">
              <Filter className="w-3.5 h-3.5 text-[#8C827A]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | TaskStatus)}
                className="bg-transparent text-xs text-[#1A1A1A] focus:outline-hidden font-medium cursor-pointer"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="review">Review</option>
                <option value="revisions">Revisions</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* 5. Task List with Semantic Status Pills:
            - Green = completed
            - Blue = active
            - Amber = review/revisions
            - Red = overdue based on dueDate
        */}
        <div className="bg-white border border-[#E8E5DD] rounded-3xl divide-y divide-[#E8E5DD] shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-[#8C827A] text-xs">
              <div className="w-6 h-6 border-2 border-[#2B4C7E] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading tasks from MongoDB...
            </div>
          ) : filteredTasks.length > 0 ? (
            filteredTasks.map((task) => {
              const overdueTask = isOverdue(task)
              const { badgeClass, label: pillLabel } = getStatusPillClasses(
                task.status,
                overdueTask
              )

              return (
                <div
                  key={task.id}
                  className={`p-5 flex items-start gap-4 hover:bg-[#FDFBF7] transition-colors group ${
                    task.status === 'completed' ? 'opacity-65 bg-[#FAF9F5]' : ''
                  }`}
                >
                  {/* Interactive Checkbox */}
                  <input
                    type="checkbox"
                    checked={task.status === 'completed' || task.completed}
                    onChange={() =>
                      handleStatusUpdate(
                        task.id,
                        task.status === 'completed' ? 'active' : 'completed'
                      )
                    }
                    className="mt-1 h-4 w-4 rounded border-[#D0CBC0] text-[#2B4C7E] focus:ring-[#2B4C7E] cursor-pointer"
                    title={task.status === 'completed' ? 'Reopen task' : 'Mark as completed'}
                  />

                  {/* Task Center Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      {/* Status Pill with the exact requested color scheme:
                          green=completed, blue=active, amber=review/revisions, red=overdue
                      */}
                      <span
                        className={`text-[11px] uppercase tracking-wide px-2.5 py-0.5 rounded-md border ${badgeClass}`}
                      >
                        {pillLabel}
                      </span>

                      {/* Red Overdue Visual Flag if past dueDate */}
                      {overdueTask && task.status !== 'completed' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-300">
                          <AlertTriangle className="w-3 h-3 text-rose-700" />
                          Overdue
                        </span>
                      )}

                      <span className="text-xs font-semibold text-[#8C827A]">
                        {task.category}
                      </span>
                    </div>

                    <h3
                      className={`text-sm font-semibold text-[#1A1A1A] group-hover:text-[#2B4C7E] transition-colors ${
                        task.status === 'completed' ? 'line-through text-[#8C827A]' : ''
                      }`}
                    >
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="text-xs text-[#6B6862] mt-1 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-[#6B6862]">
                      <span
                        className={`flex items-center gap-1 font-mono ${
                          overdueTask ? 'text-rose-700 font-bold' : ''
                        }`}
                      >
                        <Clock
                          className={`w-3.5 h-3.5 ${
                            overdueTask ? 'text-rose-600' : 'text-[#8C827A]'
                          }`}
                        />
                        <span>Due {task.dueTime}</span>
                      </span>

                      {task.assignedTo && (
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-[#8C827A]" />
                          <span>{task.assignedTo}</span>
                        </span>
                      )}

                      {task.status === 'completed' && task.completedAt && (
                        <span className="text-emerald-800 font-medium">
                          ✓ Completed at {task.completedAt}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Dropdown (PATCH /api/tasks/:id/status) */}
                  <div className="shrink-0">
                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleStatusUpdate(task.id, e.target.value as TaskStatus)
                      }
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-[#E8E5DD] bg-white text-[#1A1A1A] font-semibold hover:border-[#2B4C7E] focus:outline-hidden cursor-pointer"
                    >
                      <option value="active">Active (Blue)</option>
                      <option value="review">Review (Amber)</option>
                      <option value="revisions">Revisions (Amber)</option>
                      <option value="completed">Completed (Green)</option>
                    </select>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="p-12 text-center text-[#57534E]">
              <img
                src="/hi.png"
                alt="All clear"
                className="h-28 sm:h-36 w-auto object-contain mx-auto mb-3 drop-shadow-md"
              />
              <p className="text-base font-bold text-[#1A1A1A]">
                All clear! Nothing on your plate right now
              </p>
              <p className="text-xs text-[#57534E] mt-1 max-w-sm mx-auto">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search query or status filter.'
                  : 'Add a new task using the quick-add input above.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
