export type NavItemId =
  | 'today'
  | 'dashboard'
  | 'my-tasks'
  | 'team-view'
  | 'spotlight'
  | 'completed-tasks'
  | 'tv-mode'

export type TaskStatus = 'active' | 'review' | 'revisions' | 'completed'

export interface BackendUser {
  _id: string
  name: string
  role: string
  email: string
  designation?: string
}

export interface Client {
  _id: string
  name: string
  industry: string
  status: 'active' | 'onboarding' | 'paused'
  createdAt?: string
}

export interface BackendTask {
  _id: string
  title: string
  description?: string
  category?: string
  client?: Client | string | null
  assignee?: BackendUser | null
  status: TaskStatus
  dueDate?: string | null
  completedAt?: string | null
  createdAt?: string
}

export interface Task {
  id: string
  title: string
  description?: string
  category: string
  priority: 'urgent' | 'medium' | 'low'
  status: TaskStatus
  dueTime: string
  dueDate?: string | null
  completed: boolean
  assignedTo?: string
  assigneeId?: string
  client?: Client | string | null
  clientName?: string
  completedAt?: string
}

export interface TeamMember {
  id: string
  name: string
  role: string
  designation?: string
  email?: string
  status: 'active' | 'busy' | 'away'
  tasksCount: number
  capacity: number // percentage
  avatarInitial: string
  todayLeave?: LeaveEntry | null
}

export type LeaveType = 'full' | 'half'

export interface LeaveEntry {
  _id: string
  user: BackendUser | string
  userId?: string
  date: string
  type: LeaveType
  reason?: string
  createdAt?: string
}

export interface Metric {
  id: string
  label: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  caption: string
}

export interface DailyLogEntry {
  id: string
  userId: string
  userName: string
  text: string
  timestamp: string
  createdAt: number
}

export interface AuthUser {
  id: string
  role: 'member' | 'admin' | string
  name?: string
  email?: string
  exp?: number
  iat?: number
}
