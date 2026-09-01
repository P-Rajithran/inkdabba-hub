import type { BackendTask, BackendUser, TaskStatus } from '../types'

export const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api`
  : '/api'

let currentToken: string | null =
  typeof window !== 'undefined' ? localStorage.getItem('inkdabba_auth_token') : null

export function setAuthToken(token: string | null) {
  currentToken = token
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('inkdabba_auth_token', token)
    } else {
      localStorage.removeItem('inkdabba_auth_token')
    }
  }
}

export function getAuthToken(): string | null {
  if (!currentToken && typeof window !== 'undefined') {
    currentToken = localStorage.getItem('inkdabba_auth_token')
  }
  return currentToken
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

/**
 * Auto-authenticate as default admin operator if token is missing
 */
async function ensureAuthenticated(): Promise<string | null> {
  let token = getAuthToken()
  if (token) return token

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'prakash@inkdabba.com',
        password: 'password123',
      }),
    })

    if (res.ok) {
      const data = await res.json()
      setAuthToken(data.token)
      return data.token
    }
  } catch (err) {
    console.warn('Could not auto-login:', err)
  }
  return null
}

/**
 * GET /api/tasks/mine
 * Retrieve tasks assigned to current authenticated user
 */
export async function fetchMyTasksFromApi(status?: string): Promise<BackendTask[]> {
  await ensureAuthenticated()
  const url = status
    ? `${API_BASE}/tasks/mine?status=${encodeURIComponent(status)}`
    : `${API_BASE}/tasks/mine`

  const res = await fetch(url, {
    headers: getAuthHeaders(),
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch my tasks: ${res.statusText}`)
  }
  return res.json()
}

/**
 * GET /api/tasks (Admin only)
 */
export async function fetchTasksFromApi(status?: string): Promise<BackendTask[]> {
  await ensureAuthenticated()
  const url = status
    ? `${API_BASE}/tasks?status=${encodeURIComponent(status)}`
    : `${API_BASE}/tasks`

  const res = await fetch(url, {
    headers: getAuthHeaders(),
  })

  if (!res.ok) {
    // If forbidden (non-admin), fallback to /mine
    if (res.status === 403) {
      return fetchMyTasksFromApi(status)
    }
    throw new Error(`Failed to fetch tasks: ${res.statusText}`)
  }
  return res.json()
}

/**
 * POST /api/tasks
 * Create task (assignee defaults to req.userId unless admin specifies another user)
 */
export async function createTaskApi(taskData: {
  title: string
  description?: string
  assignee?: string | null
  status?: TaskStatus
  dueDate?: string | null
}): Promise<BackendTask> {
  await ensureAuthenticated()
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(taskData),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || `Failed to create task: ${res.statusText}`)
  }
  return res.json()
}

/**
 * PATCH /api/tasks/:id/status
 * Update status (only assignee or admin)
 */
export async function updateTaskStatusApi(id: string, status: TaskStatus): Promise<BackendTask> {
  await ensureAuthenticated()
  const res = await fetch(`${API_BASE}/tasks/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || `Failed to update status: ${res.statusText}`)
  }
  const data = await res.json()
  return data.task || data
}

/**
 * GET /api/users
 */
export async function fetchUsersFromApi(): Promise<BackendUser[]> {
  const res = await fetch(`${API_BASE}/users`)
  if (!res.ok) {
    throw new Error(`Failed to fetch users: ${res.statusText}`)
  }
  return res.json()
}

/**
 * GET /api/health
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { method: 'GET' })
    return res.ok
  } catch {
    return false
  }
}

export interface LeaderboardEntry {
  userId: string
  name: string
  email: string
  role: string
  count: number
  points: number
  rank: number
  recentTasks?: Array<{ title: string; completedAt?: string }>
}

export interface LeaderboardResponse {
  range: 'day' | 'week' | 'month'
  startDate: string
  totalCompleted: number
  leaderboard: LeaderboardEntry[]
}

/**
 * GET /api/leaderboard?range=day|week|month
 */
export async function fetchLeaderboardApi(
  range: 'day' | 'week' | 'month' = 'week'
): Promise<LeaderboardResponse> {
  const res = await fetch(`${API_BASE}/leaderboard?range=${range}`)
  if (!res.ok) {
    throw new Error(`Failed to fetch leaderboard: ${res.statusText}`)
  }
  return res.json()
}

/**
 * GET /api/leave/today
 * Retrieve all leave entries for today
 */
export async function fetchTodayLeaveApi(): Promise<import('../types').LeaveEntry[]> {
  const res = await fetch(`${API_BASE}/leave/today`)
  if (!res.ok) {
    throw new Error(`Failed to fetch today leave entries: ${res.statusText}`)
  }
  return res.json()
}

/**
 * POST /api/leave (Admin only)
 */
export async function createLeaveApi(leaveData: {
  userId: string
  type: 'full' | 'half'
  date?: string
  reason?: string
}): Promise<import('../types').LeaveEntry> {
  await ensureAuthenticated()
  const res = await fetch(`${API_BASE}/leave`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(leaveData),
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || `Failed to record leave: ${res.statusText}`)
  }
  return res.json()
}

/**
 * GET /api/clients
 * Retrieve all clients
 */
export async function fetchClientsApi(): Promise<import('../types').Client[]> {
  const res = await fetch(`${API_BASE}/clients`)
  if (!res.ok) {
    throw new Error(`Failed to fetch clients: ${res.statusText}`)
  }
  return res.json()
}

