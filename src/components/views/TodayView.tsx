import { useState } from 'react'
import type React from 'react'
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Send,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react'
import type { Task, TaskStatus, TeamMember, DailyLogEntry } from '../../types'
import { isDueToday, isOverdue, getStatusPillClasses, calculateUserStats } from '../../utils/taskUtils'

interface TodayViewProps {
  tasks: Task[]
  currentUser: TeamMember
  teamMembers: TeamMember[]
  onSelectUser: (user: TeamMember) => void
  onToggleTask: (taskId: string) => void
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void
  onNewTaskClick: () => void
}

export const TodayView: React.FC<TodayViewProps> = ({
  tasks,
  currentUser,
  teamMembers: _teamMembers,
  onSelectUser: _onSelectUser,
  onToggleTask,
  onUpdateStatus,
  onNewTaskClick,
}) => {
  const getInitialLogs = (user: TeamMember): DailyLogEntry[] => {
    const storageKey = `inkdabba_daily_logs_${user.id || user.name}`
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) return JSON.parse(saved)
    } catch {
      // ignore
    }
    return [
      {
        id: 'log-1',
        userId: user.id,
        userName: user.name,
        text: 'Shift started. Checked digital press alignment and verified raw paper stock bay.',
        timestamp: '08:15 AM',
        createdAt: Date.now() - 3600000 * 3,
      },
    ]
  }

  const [logInput, setLogInput] = useState('')
  const [dailyLogs, setDailyLogs] = useState<DailyLogEntry[]>(() => getInitialLogs(currentUser))
  const [prevUserId, setPrevUserId] = useState(currentUser.id)

  // Re-sync logs if active user changes
  if (currentUser.id !== prevUserId) {
    setPrevUserId(currentUser.id)
    setDailyLogs(getInitialLogs(currentUser))
  }

  // Calculate four stat cards pulled from /api/tasks filtered to logged-in user
  const { total, done, active, review, userTasks } = calculateUserStats(
    tasks,
    currentUser.id,
    currentUser.name
  )

  // Today's Focus: tasks assigned to this user that are due today
  const todaysFocusTasks = userTasks.filter((task) => isDueToday(task))

  // Formatted date
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault()
    if (!logInput.trim()) return

    const now = new Date()
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })

    const newEntry: DailyLogEntry = {
      id: `log-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      text: logInput.trim(),
      timestamp: timeStr,
      createdAt: Date.now(),
    }

    const updated = [newEntry, ...dailyLogs]
    setDailyLogs(updated)
    setLogInput('')

    const storageKey = `inkdabba_daily_logs_${currentUser.id || currentUser.name}`
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated))
    } catch {
      // ignore
    }
  }

  const handleDeleteLog = (logId: string) => {
    const updated = dailyLogs.filter((l) => l.id !== logId)
    setDailyLogs(updated)
    const storageKey = `inkdabba_daily_logs_${currentUser.id || currentUser.name}`
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated))
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-10 animate-fade-in">
      {/* 1. Greeting Header with logged-in user's name & today's date */}
      <div className="bg-white border border-[#E8E5DD] rounded-3xl p-6 lg:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#2B4C7E] bg-[#EBF1F8] px-2.5 py-1 rounded-md">
                <Sparkles className="w-3.5 h-3.5" />
                Today's Overview
              </span>
              <span className="text-xs font-medium text-[#8C827A] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#8C827A]" />
                {todayFormatted}
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#1A1A1A]">
              Good morning, {currentUser.name}
            </h1>

            <p className="text-sm text-[#6B6862] max-w-xl">
              {currentUser.role} • You have{' '}
              <span className="font-semibold text-[#1A1A1A]">
                {active} active
              </span>{' '}
              and{' '}
              <span className="font-semibold text-amber-800">
                {review} in review
              </span>{' '}
              out of {total} total tasks assigned to you.
            </p>
          </div>

          {/* Today's Team Pulse */}
          <div className="flex flex-col gap-2 self-start md:self-center bg-[#F7F5F1] p-3.5 rounded-2xl border border-[#E8E5DD]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#57534E]">
              Today's Team Attendance
            </span>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#1A1A1A]">
              <span className="flex items-center gap-1 text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 6 Active
              </span>
              <span className="flex items-center gap-1 text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-lg">
                🌓 Ritika (½ Day)
              </span>
              <span className="flex items-center gap-1 text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                🌙 Karthik (Away)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Four Stat Cards (Total, Done, Active, Review) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total */}
        <div className="bg-white border border-[#E8E5DD] rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-[#D4DFEE] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B6862]">
              Total Tasks
            </span>
            <Layers className="w-4 h-4 text-[#6B6862]" />
          </div>
          <div className="my-3 text-3xl lg:text-4xl font-extrabold text-[#1A1A1A]">
            {total}
          </div>
          <div className="text-xs font-medium text-[#8C827A] pt-2 border-t border-[#F0EDE6]">
            All assigned to {currentUser.name}
          </div>
        </div>

        {/* Done */}
        <div className="bg-white border border-[#E8E5DD] rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-emerald-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Done
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="my-3 text-3xl lg:text-4xl font-extrabold text-emerald-900">
            {done}
          </div>
          <div className="text-xs font-medium text-emerald-800 pt-2 border-t border-[#F0EDE6] flex items-center justify-between">
            <span>Completed</span>
            <span className="font-bold">
              {total > 0 ? `${Math.round((done / total) * 100)}%` : '0%'}
            </span>
          </div>
        </div>

        {/* Active */}
        <div className="bg-white border border-[#E8E5DD] rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-[#2B4C7E]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2B4C7E]">
              Active
            </span>
            <Clock className="w-4 h-4 text-[#2B4C7E]" />
          </div>
          <div className="my-3 text-3xl lg:text-4xl font-extrabold text-[#2B4C7E]">
            {active}
          </div>
          <div className="text-xs font-medium text-[#57534E] pt-2 border-t border-[#F0EDE6]">
            In production / queued
          </div>
        </div>

        {/* Review */}
        <div className="bg-white border border-[#E8E5DD] rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-amber-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Review
            </span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="my-3 text-3xl lg:text-4xl font-extrabold text-amber-900">
            {review}
          </div>
          <div className="text-xs font-medium text-amber-800 pt-2 border-t border-[#F0EDE6]">
            Awaiting client / QA signoff
          </div>
        </div>
      </div>

      {/* 3. Main Split Area: Today's Focus & Daily Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: "Today's Focus" list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#1A1A1A]">Today's Focus</h2>
              <p className="text-xs text-[#6B6862]">
                Due-today assignments for {currentUser.name} ({todaysFocusTasks.length})
              </p>
            </div>

            <button
              onClick={onNewTaskClick}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2B4C7E] hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Task</span>
            </button>
          </div>

          <div className="bg-white border border-[#E8E5DD] rounded-2xl divide-y divide-[#E8E5DD] shadow-xs overflow-hidden">
            {todaysFocusTasks.map((task) => {
              const overdue = isOverdue(task)
              const { badgeClass, label: pillLabel } = getStatusPillClasses(task.status, overdue)

              return (
                <div
                  key={task.id}
                  className={`p-5 flex items-start gap-4 hover:bg-[#FDFBF7] transition-colors group ${
                    task.status === 'completed' ? 'opacity-65 bg-[#FAF9F5]' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={task.status === 'completed' || task.completed}
                    onChange={() => onToggleTask(task.id)}
                    className="mt-1.5 h-4 w-4 rounded border-[#D0CBC0] text-[#2B4C7E] focus:ring-[#2B4C7E] cursor-pointer"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      {/* Semantic Status Pill */}
                      <span
                        className={`text-[11px] uppercase tracking-wide px-2.5 py-0.5 rounded-md border ${badgeClass}`}
                      >
                        {pillLabel}
                      </span>

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

                    <div className="flex items-center gap-3 mt-2.5 text-xs text-[#6B6862]">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-[#8C827A]" />
                        Due {task.dueTime}
                      </span>
                      {task.status === 'completed' && task.completedAt && (
                        <span className="text-emerald-800 font-medium">
                          • Done at {task.completedAt}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Dropdown to switch status instantly */}
                  <div className="shrink-0">
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

            {todaysFocusTasks.length === 0 && (
              <div className="p-10 text-center text-[#57534E]">
                <img
                  src="/hi.png"
                  alt="All clear"
                  className="h-28 sm:h-36 w-auto object-contain mx-auto mb-3 drop-shadow-md"
                />
                <p className="text-base font-bold text-[#1A1A1A]">
                  All clear! Nothing on your plate right now
                </p>
                <p className="text-xs text-[#57534E] mt-1 max-w-sm mx-auto">
                  You are all caught up for today or all scheduled jobs have been completed.
                </p>
                <button
                  onClick={onNewTaskClick}
                  className="mt-4 px-4 py-2 bg-[#2B4C7E] text-white text-xs font-semibold rounded-xl hover:bg-[#213C64] transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Assign New Task</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: 4. Simple Daily Log Text Input & Log Entries */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-[#1A1A1A]">Daily Log</h2>
            <p className="text-xs text-[#6B6862]">
              Shift notes and machine run logs for {currentUser.name}
            </p>
          </div>

          <div className="bg-white border border-[#E8E5DD] rounded-2xl p-5 shadow-xs space-y-4">
            {/* Form Input */}
            <form onSubmit={handleAddLog} className="space-y-3">
              <div className="relative">
                <textarea
                  rows={3}
                  placeholder="Record shift note (e.g. Meta Ads ROAS verified 4.2x; React dashboard API integrated; Figma UI review completed)..."
                  value={logInput}
                  onChange={(e) => setLogInput(e.target.value)}
                  className="w-full p-3 bg-[#F7F5F1] border border-[#E8E5DD] rounded-xl text-xs text-[#1A1A1A] placeholder-[#8C827A] focus:outline-hidden focus:border-[#2B4C7E] focus:bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#8C827A]">
                  Logs stored for today's shift
                </span>
                <button
                  type="submit"
                  disabled={!logInput.trim()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2B4C7E] disabled:opacity-40 text-white text-xs font-semibold rounded-xl hover:bg-[#213C64] transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Save Log</span>
                </button>
              </div>
            </form>

            {/* List of Today's Log Entries */}
            <div className="space-y-2.5 pt-2 border-t border-[#F0EDE6] max-h-80 overflow-y-auto pr-1">
              {dailyLogs.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 rounded-xl bg-[#F7F5F1] border border-[#E8E5DD] flex items-start justify-between gap-3 group"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-semibold text-[#2B4C7E]">
                        {entry.timestamp}
                      </span>
                      <span className="text-[10px] text-[#8C827A]">
                        • {entry.userName}
                      </span>
                    </div>
                    <p className="text-xs text-[#1A1A1A] leading-relaxed break-words">
                      {entry.text}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteLog(entry.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#8C827A] hover:text-rose-600 transition-opacity"
                    title="Delete log note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {dailyLogs.length === 0 && (
                <div className="text-center py-6 text-[#8C827A] text-xs">
                  No log entries yet today. Enter your shift notes above.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
