import type { Task, TaskStatus } from '../types'

/**
 * Determines if a task is due today.
 * Matches if dueDate is today's local date, or if task is scheduled for today's shift.
 */
export function isDueToday(task: Task): boolean {
  if (task.dueDate) {
    const due = new Date(task.dueDate)
    const now = new Date()
    return (
      due.getFullYear() === now.getFullYear() &&
      due.getMonth() === now.getMonth() &&
      due.getDate() === now.getDate()
    )
  }
  // If no explicit date is set but dueTime exists, it's considered scheduled for today's shift
  return Boolean(task.dueTime)
}

/**
 * Determines if a task is overdue.
 * A task is overdue if not completed and dueDate has passed.
 */
export function isOverdue(task: Task): boolean {
  if (task.status === 'completed' || task.completed) return false

  if (task.dueDate) {
    const due = new Date(task.dueDate)
    return due.getTime() < Date.now()
  }

  return false
}

/**
 * Returns semantic color classes for status pills regardless of base palette:
 * - Green = Done
 * - Amber = Review
 * - Red = Overdue
 * - Purple = Revisions
 * - Blue = Active
 */
export function getStatusPillClasses(status: TaskStatus, overdue: boolean): {
  badgeClass: string
  dotClass: string
  label: string
} {
  if (overdue && status !== 'completed') {
    return {
      badgeClass: 'bg-rose-100 text-rose-900 border-rose-300 font-semibold',
      dotClass: 'bg-rose-600',
      label: 'Overdue',
    }
  }

  switch (status) {
    case 'completed':
      return {
        badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold',
        dotClass: 'bg-emerald-600',
        label: 'Completed',
      }
    case 'review':
      return {
        badgeClass: 'bg-amber-100 text-amber-950 border-amber-300 font-semibold',
        dotClass: 'bg-amber-600',
        label: 'Review',
      }
    case 'revisions':
      return {
        badgeClass: 'bg-amber-100 text-amber-950 border-amber-300 font-semibold',
        dotClass: 'bg-amber-600',
        label: 'Revisions',
      }
    case 'active':
    default:
      return {
        badgeClass: 'bg-blue-100 text-blue-900 border-blue-300 font-semibold',
        dotClass: 'bg-blue-600',
        label: 'Active',
      }
  }
}

/**
 * Calculates four stat cards for a specific user:
 * Total, Done, Active, Review
 */
export function calculateUserStats(tasks: Task[], userId?: string, userName?: string) {
  const userTasks = tasks.filter((task) => {
    if (userId && task.assigneeId === userId) return true
    if (userName && task.assignedTo?.toLowerCase() === userName.toLowerCase()) return true
    return false
  })

  const total = userTasks.length
  const done = userTasks.filter((t) => t.status === 'completed' || t.completed).length
  const active = userTasks.filter((t) => t.status === 'active' && !t.completed).length
  const review = userTasks.filter((t) => t.status === 'review' && !t.completed).length

  return {
    total,
    done,
    active,
    review,
    userTasks,
  }
}

/**
 * Calculates the four stat cards explicitly requested for the user's own tasks:
 * Total, Done, Active, Overdue
 */
export function calculateMyTaskStats(myTasks: Task[]) {
  const total = myTasks.length
  const done = myTasks.filter((t) => t.status === 'completed' || t.completed).length
  const active = myTasks.filter((t) => t.status === 'active' && !t.completed).length
  const overdue = myTasks.filter((t) => isOverdue(t)).length

  return { total, done, active, overdue }
}

/**
 * Finds the single most overdue task (earliest past dueDate and not completed).
 */
export function getMostOverdueTask(tasks: Task[]): Task | null {
  const overdueTasks = tasks.filter((t) => isOverdue(t))
  if (overdueTasks.length === 0) return null

  return overdueTasks.sort((a, b) => {
    const timeA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
    const timeB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
    return timeA - timeB
  })[0]
}

/**
 * Returns a human-friendly string describing how long a task is overdue.
 */
export function getOverdueDurationString(dueDate?: string | null): string {
  if (!dueDate) return 'Overdue'
  const diffMs = Date.now() - new Date(dueDate).getTime()
  if (diffMs <= 0) return 'Due now'

  const diffMins = Math.floor(diffMs / (1000 * 60))
  if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? 'min' : 'mins'} overdue`
  }

  const diffHours = Math.floor(diffMins / 60)
  const remainingMins = diffMins % 60
  if (diffHours < 24) {
    return remainingMins > 0
      ? `${diffHours}h ${remainingMins}m overdue`
      : `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} overdue`
  }

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} overdue`
}
