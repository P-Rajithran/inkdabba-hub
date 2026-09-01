import { useState } from 'react'
import type React from 'react'
import {
  Clock,
  Plus,
  Search,
  AlertTriangle,
  User,
} from 'lucide-react'
import type { Task, TaskStatus, TeamMember } from '../../types'
import { isOverdue, getStatusPillClasses } from '../../utils/taskUtils'

interface MyTasksViewProps {
  tasks: Task[]
  currentUser: TeamMember
  teamMembers: TeamMember[]
  onToggleTask: (taskId: string) => void
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void
  onAddTask: (newTask: {
    title: string
    description?: string
    category: string
    priority: 'urgent' | 'medium' | 'low'
    status: TaskStatus
    dueTime: string
    assigneeId?: string
    assignedTo?: string
  }) => void
}

type TabKey = 'all' | TaskStatus

export const MyTasksView: React.FC<MyTasksViewProps> = ({
  tasks,
  currentUser,
  teamMembers,
  onToggleTask,
  onUpdateStatus,
  onAddTask,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [scope, setScope] = useState<'my' | 'all'>('my')

  // Quick-add state
  const [quickTitle, setQuickTitle] = useState('')
  const [quickCategory, setQuickCategory] = useState('Design')
  const [quickPriority, setQuickPriority] = useState<'urgent' | 'medium' | 'low'>('medium')
  const [quickAssigneeId, setQuickAssigneeId] = useState<string>(currentUser.id)
  const [quickDueTime, setQuickDueTime] = useState('04:00 PM')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [quickDescription, setQuickDescription] = useState('')

  // Scope filter: user's tasks vs all tasks
  const scopedTasks = tasks.filter((task) => {
    if (scope === 'my') {
      return (
        task.assigneeId === currentUser.id ||
        task.assignedTo?.toLowerCase() === currentUser.name.toLowerCase()
      )
    }
    return true
  })

  // Tab filter: All / Active / Review / Revisions / Completed
  const tabFilteredTasks = scopedTasks.filter((task) => {
    if (activeTab === 'all') return true
    return task.status === activeTab
  })

  // Search filter
  const finalTasks = tabFilteredTasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.assignedTo && task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickTitle.trim()) return

    const targetAssignee = teamMembers.find((m) => m.id === quickAssigneeId) || currentUser

    onAddTask({
      title: quickTitle.trim(),
      description: quickDescription.trim() || undefined,
      category: quickCategory,
      priority: quickPriority,
      status: 'active',
      dueTime: quickDueTime,
      assigneeId: targetAssignee.id,
      assignedTo: targetAssignee.name,
    })

    setQuickTitle('')
    setQuickDescription('')
    setShowAdvanced(false)
  }

  // Count helper for tabs
  const getTabCount = (tab: TabKey) => {
    if (tab === 'all') return scopedTasks.length
    return scopedTasks.filter((t) => t.status === tab).length
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header with Scope Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">My Tasks</h1>
          <p className="text-xs text-[#6B6862]">
            Operations workflow queue with real-time status management
          </p>
        </div>

        {/* Scope Toggle: My Tasks vs All Team Tasks */}
        <div className="flex items-center gap-1.5 p-1 bg-[#EFECE6] rounded-xl self-start">
          <button
            onClick={() => setScope('my')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              scope === 'my'
                ? 'bg-white text-[#2B4C7E] shadow-xs'
                : 'text-[#6B6862] hover:text-[#1A1A1A]'
            }`}
          >
            Assigned to {currentUser.name} ({tasks.filter(t => t.assigneeId === currentUser.id || t.assignedTo === currentUser.name).length})
          </button>
          <button
            onClick={() => setScope('all')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              scope === 'all'
                ? 'bg-white text-[#2B4C7E] shadow-xs'
                : 'text-[#6B6862] hover:text-[#1A1A1A]'
            }`}
          >
            All Studio Tasks ({tasks.length})
          </button>
        </div>
      </div>

      {/* Quick-Add Task Input Bar */}
      <div className="bg-white border border-[#2B4C7E]/30 rounded-2xl p-5 shadow-xs transition-all">
        <form onSubmit={handleQuickAddSubmit} className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="+ Quick-add task for today... (e.g. Inspect offset press viscosity, press Enter)"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              className="flex-1 px-4 py-3 bg-[#F7F5F1] border border-[#E8E5DD] rounded-xl text-sm text-[#1A1A1A] placeholder-[#8C827A] focus:outline-hidden focus:border-[#2B4C7E] focus:bg-white transition-colors"
            />

            <button
              type="submit"
              disabled={!quickTitle.trim()}
              className="px-5 py-3 bg-[#2B4C7E] disabled:opacity-40 text-white rounded-xl text-xs font-bold hover:bg-[#213C64] transition-all shadow-xs flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="px-3 py-3 rounded-xl border border-[#E8E5DD] hover:bg-[#F7F5F1] text-xs font-semibold text-[#6B6862] shrink-0 transition-colors"
            >
              {showAdvanced ? 'Simple' : 'Options'}
            </button>
          </div>

          {/* Expandable options for quick-add */}
          {showAdvanced && (
            <div className="pt-2 border-t border-[#F0EDE6] grid grid-cols-1 sm:grid-cols-5 gap-3 animate-fade-in">
              <input
                type="text"
                placeholder="Description (optional)..."
                value={quickDescription}
                onChange={(e) => setQuickDescription(e.target.value)}
                className="px-3 py-2 bg-[#F7F5F1] border border-[#E8E5DD] rounded-xl text-xs text-[#1A1A1A] placeholder-[#8C827A] focus:outline-hidden focus:border-[#2B4C7E]"
              />

              <select
                value={quickAssigneeId}
                onChange={(e) => setQuickAssigneeId(e.target.value)}
                className="px-3 py-2 bg-[#F7F5F1] border border-[#E8E5DD] rounded-xl text-xs text-[#1A1A1A] focus:outline-hidden focus:border-[#2B4C7E]"
              >
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    Assignee: {m.name}
                  </option>
                ))}
              </select>

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

              <input
                type="text"
                placeholder="Due: 04:00 PM"
                value={quickDueTime}
                onChange={(e) => setQuickDueTime(e.target.value)}
                className="px-3 py-2 bg-[#F7F5F1] border border-[#E8E5DD] rounded-xl text-xs text-[#1A1A1A] placeholder-[#8C827A] focus:outline-hidden focus:border-[#2B4C7E]"
              />
            </div>
          )}
        </form>
      </div>

      {/* Tabs: All / Active / Review / Revisions / Completed */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#EFECE6] rounded-xl self-start">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'all'
                ? 'bg-white text-[#1A1A1A] shadow-xs'
                : 'text-[#6B6862] hover:text-[#1A1A1A]'
            }`}
          >
            All ({getTabCount('all')})
          </button>

          <button
            onClick={() => setActiveTab('active')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'active'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-[#6B6862] hover:text-[#1A1A1A]'
            }`}
          >
            Active ({getTabCount('active')})
          </button>

          <button
            onClick={() => setActiveTab('review')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'review'
                ? 'bg-white text-amber-900 shadow-xs'
                : 'text-[#6B6862] hover:text-[#1A1A1A]'
            }`}
          >
            Review ({getTabCount('review')})
          </button>

          <button
            onClick={() => setActiveTab('revisions')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'revisions'
                ? 'bg-white text-purple-900 shadow-xs'
                : 'text-[#6B6862] hover:text-[#1A1A1A]'
            }`}
          >
            Revisions ({getTabCount('revisions')})
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'completed'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-[#6B6862] hover:text-[#1A1A1A]'
            }`}
          >
            Completed ({getTabCount('completed')})
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white border border-[#E8E5DD] rounded-xl text-xs text-[#1A1A1A] placeholder-[#8C827A] focus:outline-hidden focus:border-[#2B4C7E] w-52 sm:w-60"
          />
        </div>
      </div>

      {/* List View of Tasks with Semantic Color Status Pills */}
      <div className="bg-white border border-[#E8E5DD] rounded-2xl divide-y divide-[#E8E5DD] shadow-xs overflow-hidden">
        {finalTasks.map((task) => {
          const overdue = isOverdue(task)
          const { badgeClass, label: pillLabel } = getStatusPillClasses(task.status, overdue)

          return (
            <div
              key={task.id}
              className={`p-5 flex items-start gap-4 hover:bg-[#FDFBF7] transition-colors group ${
                task.status === 'completed' ? 'opacity-65 bg-[#FAF9F5]' : ''
              }`}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={task.status === 'completed' || task.completed}
                onChange={() => onToggleTask(task.id)}
                className="mt-1.5 h-4 w-4 rounded border-[#D0CBC0] text-[#2B4C7E] focus:ring-[#2B4C7E] cursor-pointer"
              />

              {/* Task Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  {/* Semantic Status Pill: green=done, amber=review, red=overdue */}
                  <span
                    className={`text-[11px] uppercase tracking-wide px-2.5 py-0.5 rounded-md border shadow-2xs ${badgeClass}`}
                  >
                    {pillLabel}
                  </span>

                  {overdue && task.status !== 'completed' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-300">
                      <AlertTriangle className="w-3 h-3 text-rose-700" />
                      Overdue
                    </span>
                  )}

                  <span
                    className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded ${
                      task.priority === 'urgent'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-[#F2EFE8] text-[#57534E]'
                    }`}
                  >
                    {task.priority}
                  </span>

                  <span className="text-xs font-medium text-[#8C827A]">
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
                      overdue ? 'text-rose-700 font-semibold' : ''
                    }`}
                  >
                    <Clock className={`w-3.5 h-3.5 ${overdue ? 'text-rose-600' : 'text-[#8C827A]'}`} />
                    Due {task.dueTime}
                  </span>

                  {task.assignedTo && (
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-[#8C827A]" />
                      {task.assignedTo}
                    </span>
                  )}

                  {task.status === 'completed' && task.completedAt && (
                    <span className="text-emerald-800 font-medium">
                      ✓ Completed at {task.completedAt}
                    </span>
                  )}
                </div>
              </div>

              {/* Status Selector Dropdown for PATCH /api/tasks/:id/status */}
              <div className="shrink-0 flex items-center gap-2">
                <select
                  value={task.status}
                  onChange={(e) => onUpdateStatus(task.id, e.target.value as TaskStatus)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-[#E8E5DD] bg-white text-[#1A1A1A] font-medium hover:border-[#2B4C7E] focus:outline-hidden"
                >
                  <option value="active">Active</option>
                  <option value="review">Review</option>
                  <option value="revisions">Revisions</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          )
        })}

        {finalTasks.length === 0 && (
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
              There are no {activeTab === 'all' ? '' : activeTab} tasks for the selected view. Take a break or add a new task above.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
