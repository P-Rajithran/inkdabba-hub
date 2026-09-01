import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { TodayView } from './components/views/TodayView'
import { DashboardView } from './components/views/DashboardView'
import { MyTasksView } from './components/views/MyTasksView'
import { TeamView } from './components/views/TeamView'
import { CompletedTasksView } from './components/views/CompletedTasksView'
import { SpotlightView } from './components/views/SpotlightView'
import { TVRoute } from './components/views/TVRoute'
import { SplashScreen } from './components/SplashScreen'
import { LoginPage } from './components/auth/LoginPage'
import { RegisterPage } from './components/auth/RegisterPage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { useAuth } from './context/useAuth'
import type { NavItemId, Task, TaskStatus, TeamMember, BackendTask, BackendUser } from './types'
import { INITIAL_TASKS, TEAM_MEMBERS, DASHBOARD_METRICS } from './data/mockData'
import {
  fetchTasksFromApi,
  fetchUsersFromApi,
  createTaskApi,
  updateTaskStatusApi,
} from './services/api'

/**
 * Main Protected Dashboard Layout
 */
interface DashboardLayoutProps {
  initialView?: NavItemId
}

function DashboardLayout({ initialView = 'today' }: DashboardLayoutProps = {}) {
  const { currentUser: authUser, logout } = useAuth()
  const navigate = useNavigate()

  const [currentView, setCurrentView] = useState<NavItemId>(initialView)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false)
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(TEAM_MEMBERS)
  const [currentUser, setCurrentUser] = useState<TeamMember>(() => {
    if (authUser) {
      const match = TEAM_MEMBERS.find(
        (m) =>
          m.id === authUser.id ||
          (Boolean(m.email) && Boolean(authUser.email) && m.email?.toLowerCase() === authUser.email?.toLowerCase()) ||
          (Boolean(authUser.name) && m.name.toLowerCase() === authUser.name?.toLowerCase())
      )
      if (match) return match
    }
    return {
      id: authUser?.id || TEAM_MEMBERS[1].id,
      name: authUser?.name || 'Aswin',
      role: authUser?.role === 'admin' ? 'Admin' : 'Member',
      email: authUser?.email || 'aswin@inkdabba.com',
      status: 'active',
      tasksCount: 0,
      capacity: 75,
      avatarInitial: (authUser?.name || 'A').charAt(0).toUpperCase(),
    }
  })
  const [isDbConnected, setIsDbConnected] = useState<boolean>(false)

  // Map backend task to frontend format
  const mapBackendTask = (bt: BackendTask): Task => {
    let dueFormatted = '05:00 PM'
    if (bt.dueDate) {
      const d = new Date(bt.dueDate)
      dueFormatted = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }

    return {
      id: bt._id,
      title: bt.title,
      description: bt.description,
      category: 'Production',
      priority: bt.status === 'review' ? 'medium' : bt.status === 'revisions' ? 'urgent' : 'medium',
      status: bt.status,
      dueTime: dueFormatted,
      dueDate: bt.dueDate,
      completed: bt.status === 'completed',
      assignedTo: bt.assignee ? bt.assignee.name : undefined,
      assigneeId: bt.assignee ? bt.assignee._id : undefined,
    }
  }

  // Load tasks & users from MongoDB API on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [apiTasks, apiUsers] = await Promise.all([
          fetchTasksFromApi(),
          fetchUsersFromApi(),
        ])

        if (apiTasks && apiTasks.length > 0) {
          setTasks(apiTasks.map(mapBackendTask))
          setIsDbConnected(true)
        }

        if (apiUsers && apiUsers.length > 0) {
          const mappedUsers: TeamMember[] = apiUsers.map((u: BackendUser) => ({
            id: u._id,
            name: u.name,
            role: u.role,
            email: u.email,
            status: 'active',
            tasksCount: apiTasks ? apiTasks.filter((t: BackendTask) => t.assignee?._id === u._id).length : 0,
            capacity: Math.min(95, Math.max(35, 40 + Math.floor(Math.random() * 45))),
            avatarInitial: u.name.charAt(0).toUpperCase(),
          }))
          setTeamMembers(mappedUsers)
          setIsDbConnected(true)

          // Match logged-in user in roster
          if (authUser) {
            const matched = mappedUsers.find(
              (u) =>
                u.id === authUser.id ||
                Boolean(u.email && authUser.email && u.email.toLowerCase() === authUser.email.toLowerCase()) ||
                Boolean(authUser.name && u.name.toLowerCase() === authUser.name.toLowerCase())
            )
            if (matched) {
              setCurrentUser(matched)
            }
          }
        }
      } catch {
        // Standalone fallback
        setIsDbConnected(false)
      }
    }

    loadData()
  }, [authUser])

  // Toggle task status (completed <-> active)
  const handleToggleTask = async (taskId: string) => {
    const currentTask = tasks.find((t) => t.id === taskId)
    if (!currentTask) return

    const nextStatus: TaskStatus = currentTask.status === 'completed' ? 'active' : 'completed'
    const now = new Date()
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            status: nextStatus,
            completed: nextStatus === 'completed',
            completedAt: nextStatus === 'completed' ? timeStr : undefined,
          }
        }
        return task
      })
    )

    if (isDbConnected) {
      try {
        await updateTaskStatusApi(taskId, nextStatus)
      } catch (err) {
        console.warn('Backend sync failed:', err)
      }
    }
  }

  // Update specific status (active, review, revisions, completed)
  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    const now = new Date()
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: newStatus,
              completed: newStatus === 'completed',
              completedAt: newStatus === 'completed' ? timeStr : undefined,
            }
          : task
      )
    )

    if (isDbConnected) {
      try {
        await updateTaskStatusApi(taskId, newStatus)
      } catch (err) {
        console.warn('Backend sync failed:', err)
      }
    }
  }

  // Add task to state and backend
  const handleAddTask = async (newTaskData: {
    title: string
    description?: string
    category: string
    priority: 'urgent' | 'medium' | 'low'
    status: TaskStatus
    dueTime: string
    assigneeId?: string
    assignedTo?: string
  }) => {
    if (isDbConnected) {
      try {
        const created = await createTaskApi({
          title: newTaskData.title,
          description: newTaskData.description,
          assignee: newTaskData.assigneeId || null,
          status: newTaskData.status,
          dueDate: new Date(Date.now() + 3600000 * 4).toISOString(),
        })

        const mapped = mapBackendTask(created)
        mapped.category = newTaskData.category
        mapped.priority = newTaskData.priority
        mapped.dueTime = newTaskData.dueTime
        setTasks((prev) => [mapped, ...prev])
        return
      } catch (err) {
        console.warn('Could not persist to MongoDB, adding locally:', err)
      }
    }

    const localTask: Task = {
      id: `t-${Date.now()}`,
      title: newTaskData.title,
      description: newTaskData.description,
      category: newTaskData.category,
      priority: newTaskData.priority,
      status: newTaskData.status,
      dueTime: newTaskData.dueTime,
      completed: newTaskData.status === 'completed',
      assignedTo: newTaskData.assignedTo || currentUser.name,
      assigneeId: newTaskData.assigneeId || currentUser.id,
    }
    setTasks((prev) => [localTask, ...prev])
  }

  // Reopen completed task
  const handleReopenTask = async (taskId: string) => {
    handleUpdateStatus(taskId, 'active')
  }

  const handleSelectNav = (view: NavItemId) => {
    if (view === 'tv-mode') {
      navigate('/tv')
    } else {
      setCurrentView(view)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const myActiveTasksCount = tasks.filter(
    (t) =>
      t.status !== 'completed' &&
      (t.assigneeId === currentUser.id ||
        (t.assignedTo && t.assignedTo.toLowerCase() === currentUser.name.toLowerCase()))
  ).length

  return (
    <div className="min-h-screen bg-[#F7F5F1] text-[#1A1A1A] flex flex-col md:flex-row antialiased selection:bg-[#2B4C7E] selection:text-white">
      {/* Left Sidebar */}
      <Sidebar
        currentView={currentView}
        currentUser={currentUser}
        onSelectView={handleSelectNav}
        onLogout={handleLogout}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        taskCount={myActiveTasksCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header
          currentView={currentView}
          currentUser={currentUser}
          teamMembers={teamMembers}
          onSelectUser={setCurrentUser}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onNewTaskClick={() => setCurrentView('my-tasks')}
        />

        <main className="flex-1 px-6 lg:px-12 py-6 lg:py-8 max-w-7xl w-full mx-auto pb-12">
          {/* Today View (Personal Shift Run Sheet, Today's Focus, Team Attendance & Daily Log) */}
          {currentView === 'today' && (
            <TodayView
              tasks={tasks}
              currentUser={currentUser}
              teamMembers={teamMembers}
              onSelectUser={setCurrentUser}
              onToggleTask={handleToggleTask}
              onUpdateStatus={handleUpdateStatus}
              onNewTaskClick={() => setCurrentView('my-tasks')}
            />
          )}

          {/* Executive Agency Operations Dashboard (KPIs, 4 Department Pipelines, Client Accounts, Workload Radar) */}
          {currentView === 'dashboard' && (
            <DashboardView
              metrics={DASHBOARD_METRICS}
              teamMembers={teamMembers}
              tasks={tasks}
              onNavigateToTasks={() => setCurrentView('my-tasks')}
            />
          )}

          {/* My Tasks View */}
          {currentView === 'my-tasks' && (
            <MyTasksView
              tasks={tasks}
              currentUser={currentUser}
              teamMembers={teamMembers}
              onToggleTask={handleToggleTask}
              onUpdateStatus={handleUpdateStatus}
              onAddTask={handleAddTask}
            />
          )}

          {/* Team View */}
          {currentView === 'team-view' && (
            <TeamView tasks={tasks} members={teamMembers} />
          )}

          {/* Spotlight View */}
          {currentView === 'spotlight' && (
            <SpotlightView />
          )}

          {/* Completed Tasks View */}
          {currentView === 'completed-tasks' && (
            <CompletedTasksView
              tasks={tasks}
              onReopenTask={handleReopenTask}
            />
          )}
        </main>
      </div>
    </div>
  )
}

/**
 * Root Application Router with Route Protection
 */
export function App() {
  const { isAuthenticated, currentUser: authUser } = useAuth()
  const navigate = useNavigate()

  // Splash screen state: shown once on initial app load (or on first login)
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    return !sessionStorage.getItem('inkdabba_splash_shown')
  })

  const handleDismissSplash = useCallback(() => {
    sessionStorage.setItem('inkdabba_splash_shown', 'true')
    setShowSplash(false)
  }, [])

  // Support showing splash on first login as well
  useEffect(() => {
    const handleLoginSplash = () => {
      setShowSplash(true)
    }
    window.addEventListener('inkdabba:show-splash', handleLoginSplash)
    return () => {
      window.removeEventListener('inkdabba:show-splash', handleLoginSplash)
    }
  }, [])

  return (
    <>
      {/* Framer Motion Animated Splash Screen */}
      <AnimatePresence mode="wait">
        {showSplash && <SplashScreen onDismiss={handleDismissSplash} />}
      </AnimatePresence>

      <Routes>
      {/* Public Login Route */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />

      {/* Public Register Route */}
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
      />

      {/* Broadcast TV Route */}
      <Route
        path="/tv"
        element={<TVRoute onExit={() => navigate('/dashboard')} />}
      />

      {/* Protected Dashboard Route */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout key={authUser?.id || 'today'} initialView="today" />
          </ProtectedRoute>
        }
      />

      {/* Direct routes from TV mode or deep links */}
      <Route
        path="/team-view"
        element={
          <ProtectedRoute>
            <DashboardLayout key="team-view" initialView="team-view" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leave"
        element={
          <ProtectedRoute>
            <DashboardLayout key="leave" initialView="team-view" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <DashboardLayout key="clients" initialView="team-view" />
          </ProtectedRoute>
        }
      />

      {/* Default fallback redirects to /dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    </>
  )
}

export default App
