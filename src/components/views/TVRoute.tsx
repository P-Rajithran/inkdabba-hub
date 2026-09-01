import { useState, useEffect, useCallback } from 'react'
import type React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Maximize2,
  Minimize2,
  ArrowLeft,
  ArrowUpRight,
  Users,
  Building2,
  CheckSquare,
  Sparkles,
  Clock,
  Radio,
  Moon,
} from 'lucide-react'
import type { Task, BackendTask, TeamMember, BackendUser, LeaveEntry, Client } from '../../types'
import {
  fetchTasksFromApi,
  fetchUsersFromApi,
  fetchTodayLeaveApi,
  fetchClientsApi,
} from '../../services/api'
import { getCategoryStyle, type CategoryStyle } from '../../utils/categoryColors'
import { quotes } from '../../data/quotes'

interface TVRouteProps {
  onExit?: () => void
}

interface RawQuote {
  quote?: string
  text?: string
  author?: string
}

// Parses quotes whether structured as { quote, author }, { text, author }, or string
const parseQuote = (raw: RawQuote | string) => {
  if (typeof raw === 'string') {
    const parts = raw.split(/[-—–]\s*/)
    if (parts.length > 1) {
      return {
        text: parts[0].replace(/^["']|["']$/g, '').trim(),
        author: parts.slice(1).join('—').trim(),
      }
    }
    return { text: raw.trim(), author: 'Inkdabba Studio' }
  }
  return {
    text: raw.quote || raw.text || '',
    author: raw.author || 'Inkdabba Studio',
  }
}

// Deterministic day of the year for fixed "quote of the day"
const getDayOfYear = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

export const TVRoute: React.FC<TVRouteProps> = ({ onExit }) => {
  const navigate = useNavigate()

  const [tasks, setTasks] = useState<Task[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [todayLeaves, setTodayLeaves] = useState<LeaveEntry[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [countdown, setCountdown] = useState<number>(30)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)

  const [currentTime, setCurrentTime] = useState<string>(() =>
    new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
  )
  const [currentDate, setCurrentDate] = useState<string>(() =>
    new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  )

  // Map backend tasks to frontend task model
  const mapBackendTask = (bt: BackendTask): Task => {
    let dueFormatted = '05:00 PM'
    if (bt.dueDate) {
      const d = new Date(bt.dueDate)
      dueFormatted = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }

    const clientObj = typeof bt.client === 'object' && bt.client ? bt.client : null
    const clientName = clientObj ? clientObj.name : undefined

    return {
      id: bt._id,
      title: bt.title,
      description: bt.description,
      category: bt.category || 'design',
      priority: bt.status === 'review' ? 'medium' : bt.status === 'revisions' ? 'urgent' : 'medium',
      status: bt.status,
      dueTime: dueFormatted,
      dueDate: bt.dueDate,
      completed: bt.status === 'completed',
      assignedTo: bt.assignee ? bt.assignee.name : 'Team',
      assigneeId: bt.assignee ? bt.assignee._id : undefined,
      client: bt.client,
      clientName,
    }
  }

  // Refresh all TV dashboard data (tasks, users, leaves, clients)
  const refreshData = useCallback(async () => {
    try {
      const [apiTasks, apiUsers, apiLeaves, apiClients] = await Promise.all([
        fetchTasksFromApi().catch(() => []),
        fetchUsersFromApi().catch(() => []),
        fetchTodayLeaveApi().catch(() => []),
        fetchClientsApi().catch(() => []),
      ])

      if (apiTasks && apiTasks.length > 0) {
        setTasks(apiTasks.map(mapBackendTask))
      }

      if (apiUsers && apiUsers.length > 0) {
        setTeamMembers(
          apiUsers.map((u: BackendUser) => ({
            id: u._id,
            name: u.name,
            role: u.designation || u.role,
            designation: u.designation,
            email: u.email,
            status: 'active',
            tasksCount: 0,
            capacity: 50,
            avatarInitial: u.name.charAt(0).toUpperCase(),
          }))
        )
      }

      if (apiLeaves) {
        setTodayLeaves(apiLeaves)
      }

      if (apiClients && apiClients.length > 0) {
        setClients(apiClients)
      }
    } catch (err) {
      console.warn('TV Route background refresh error:', err)
    }
  }, [])

  // Initial load
  useEffect(() => {
    let isMounted = true
    async function loadInitial() {
      if (isMounted) {
        await refreshData()
      }
    }
    void loadInitial()
    return () => {
      isMounted = false
    }
  }, [refreshData])

  // Real-time clock tick
  useEffect(() => {
    const clockTimer = setInterval(() => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      )
      setCurrentDate(
        now.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      )
    }, 1000)

    return () => clearInterval(clockTimer)
  }, [])

  // 30-second auto-refresh polling cycle
  useEffect(() => {
    const pollInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          refreshData()
          return 30
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(pollInterval)
  }, [refreshData])

  // Fullscreen toggle handler
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  // Handle Exit TV Mode
  const handleExit = () => {
    if (onExit) {
      onExit()
    } else {
      navigate('/dashboard')
    }
  }

  // Attendance metrics for Box 1
  const totalMembers = teamMembers.length || 8
  const fullLeaveCount = teamMembers.filter((m) => {
    const leave = todayLeaves.find((l) => {
      const uId = typeof l.user === 'object' && l.user ? l.user._id : (l.user || l.userId)
      return uId === m.id || (typeof l.user === 'object' && l.user?.name === m.name)
    })
    return leave?.type === 'full'
  }).length

  const halfLeaveCount = teamMembers.filter((m) => {
    const leave = todayLeaves.find((l) => {
      const uId = typeof l.user === 'object' && l.user ? l.user._id : (l.user || l.userId)
      return uId === m.id || (typeof l.user === 'object' && l.user?.name === m.name)
    })
    return leave?.type === 'half'
  }).length

  const presentCount = Math.max(0, totalMembers - fullLeaveCount)

  // Task counts for Box 3 (Done, Active, Review for the whole team today)
  const doneCount = tasks.filter((t) => t.status === 'completed').length
  const activeCount = tasks.filter((t) => t.status === 'active').length
  const reviewCount = tasks.filter((t) => t.status === 'review' || t.status === 'revisions').length

  // Client cards for Box 2 (display top 4 to guarantee zero overflow, with "+N more" if over 4)
  const displayClients = clients.slice(0, 4)
  const remainingClientsCount = Math.max(0, clients.length - 4)

  // Quote rotation state (starts with fixed quote of the day based on date)
  const dayOfYear = getDayOfYear()
  const [quoteIndex, setQuoteIndex] = useState<number>(() => {
    return quotes && quotes.length > 0 ? dayOfYear % quotes.length : 0
  })
  const [isRotatingQuotes, setIsRotatingQuotes] = useState<boolean>(true)

  // Auto-rotate quote every 45 seconds when rotation mode is active
  useEffect(() => {
    if (!isRotatingQuotes || !quotes || quotes.length === 0) return

    const quoteTimer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length)
    }, 45000)

    return () => clearInterval(quoteTimer)
  }, [isRotatingQuotes])

  // Active quote formatted with guaranteed non-empty fallback
  const parsedActive =
    quotes && quotes.length > 0
      ? parseQuote(quotes[quoteIndex % quotes.length])
      : {
          text: 'Simplicity is about subtracting the obvious and adding the meaningful.',
          author: 'John Maeda',
        }

  const quoteText =
    parsedActive?.text?.trim() ||
    'Simplicity is about subtracting the obvious and adding the meaningful.'
  const quoteAuthor = parsedActive?.author?.trim() || 'Studio Principle'

  // TEMPORARY DEBUG: Log quote value right before render
  console.log('[DEBUG Box 4 Quote Render]', {
    quoteIndex,
    quotesLength: quotes ? quotes.length : 'undefined',
    parsedActive,
    quoteText,
    quoteAuthor,
  })

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#F7F5F1] text-[#1A1A1A] p-4 lg:p-6 flex flex-col justify-between select-none">
      {/* Top TV Broadcast Status Header */}
      <header className="flex items-center justify-between px-6 py-3 rounded-2xl bg-white border-2 border-[#E8E5DD] shadow-2xs shrink-0">
        {/* Left: Branding & Live Polling Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs lg:text-sm font-black uppercase tracking-wider text-[#1E3558]">
              Inkdabba // TV Broadcast
            </span>
          </div>
          <span className="text-[#DDD9CF] hidden sm:inline">|</span>
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono font-bold text-[#57534E]">
            <Radio className="w-3.5 h-3.5 text-[#2B4C7E]" />
            <span>Auto-refreshing in {countdown}s</span>
          </div>
        </div>

        {/* Center: Live Digital Clock & Date */}
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-[#2B4C7E] hidden md:inline" />
          <span className="font-mono text-base lg:text-lg font-black text-[#1A1A1A] tracking-tight">
            {currentTime}
          </span>
          <span className="text-[#DDD9CF] hidden md:inline">•</span>
          <span className="text-xs font-bold text-[#57534E] hidden md:inline">
            {currentDate}
          </span>
        </div>

        {/* Right: Controls (Fullscreen toggle & Exit) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="p-2 rounded-xl bg-[#F2EFE8] hover:bg-[#E5E1D8] text-[#1A1A1A] transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={handleExit}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#2B4C7E] text-white hover:bg-[#213C64] text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
        </div>
      </header>

      {/* Main 2x2 Broadcast Grid (overflow: hidden, no scrolling) */}
      <div className="grid grid-cols-2 grid-rows-2 gap-4 lg:gap-6 flex-1 min-h-0 mt-3">
        {/* =========================================================================
            BOX 1 (Top-Left): "Leave & Present"
            - Big X/Y present number
            - Avatar row below with today's leave styling (grayscale+pulsing badge for full leave, split-card shimmer for half leave)
            - Tap target that navigates to /leave
            ========================================================================= */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => navigate('/leave')}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/leave')}
          className="rounded-3xl p-6 lg:p-7 bg-white border-2 border-[#E8E5DD] shadow-xs flex flex-col justify-between overflow-hidden relative hover:border-[#2B4C7E] hover:shadow-md cursor-pointer transition-all duration-200 group active:scale-[0.995]"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#EBF1F8] text-[#2B4C7E] flex items-center justify-center font-black">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg lg:text-xl font-black text-[#1E3558] uppercase tracking-wider">
                  Leave & Present
                </h2>
                <p className="text-xs font-bold text-[#4B5563]">Studio Attendance & Capacity</p>
              </div>
            </div>
            <span className="text-xs font-black text-[#1E3558] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
              <span>View Roster</span>
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>

          {/* Big X/Y Present Number */}
          <div className="my-auto py-2">
            <div className="flex items-baseline gap-2">
              <span className="text-6xl lg:text-7xl xl:text-8xl font-black text-[#1A1A1A] tracking-tight leading-none">
                {presentCount}
              </span>
              <span className="text-3xl lg:text-4xl xl:text-5xl font-black text-[#8C827A] tracking-tight">
                /{totalMembers}
              </span>
              <div className="ml-4 flex flex-col justify-center">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-950 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-lg inline-flex items-center gap-1.5 w-fit">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  Present On Floor
                </span>
                <span className="text-xs font-bold text-[#57534E] mt-1.5">
                  {fullLeaveCount > 0 && `${fullLeaveCount} Away (Full Day)`}
                  {fullLeaveCount > 0 && halfLeaveCount > 0 && ' • '}
                  {halfLeaveCount > 0 && `${halfLeaveCount} Half Day`}
                  {fullLeaveCount === 0 && halfLeaveCount === 0 && 'Full 100% attendance reporting'}
                </span>
              </div>
            </div>
          </div>

          {/* Avatar Row Below: Showing icon-only leave badges with zero text overlap */}
          <div className="pt-3 border-t border-[#F0EDE6]">
            <div className="flex items-center justify-between gap-2 overflow-hidden">
              {teamMembers.map((member) => {
                const personLeave = todayLeaves.find((l) => {
                  const uId =
                    typeof l.user === 'object' && l.user
                      ? l.user._id
                      : (l.user || l.userId)
                  return uId === member.id || (typeof l.user === 'object' && l.user?.name === member.name)
                })
                const isFullLeave = personLeave?.type === 'full'
                const isHalfLeave = personLeave?.type === 'half'

                return (
                  <div
                    key={member.id}
                    className="flex flex-col items-center gap-1.5 flex-1 min-w-0"
                    title={`${member.name} (${member.role})${
                      isFullLeave ? ' • Away (Full Day Leave)' : isHalfLeave ? ' • Half Day Leave' : ' • Present'
                    }`}
                  >
                    {/* Avatar Container with Leave Effects */}
                    <div
                      className={`relative w-11 h-11 lg:w-13 lg:h-13 rounded-2xl flex items-center justify-center font-black text-sm lg:text-base transition-all overflow-hidden border-2 shadow-2xs ${
                        isFullLeave
                          ? 'grayscale opacity-60 bg-stone-200 border-stone-400 text-stone-700'
                          : isHalfLeave
                          ? 'border-[#2B4C7E]/40 bg-white'
                          : 'bg-[#2B4C7E] text-white border-white'
                      }`}
                    >
                      {/* Avatar Initials - Legible & Centered with NO text overlapping */}
                      {isHalfLeave ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          {/* Left half colorful */}
                          <div className="absolute inset-y-0 left-0 w-1/2 bg-[#2B4C7E] text-white flex items-center justify-end pr-0.5 font-black text-sm lg:text-base">
                            <span>{member.avatarInitial || member.name.charAt(0)}</span>
                          </div>
                          {/* Right half grayscale */}
                          <div className="absolute inset-y-0 right-0 w-1/2 bg-stone-300 text-stone-700 flex items-center justify-start pl-0.5 font-black text-sm lg:text-base grayscale opacity-80">
                            <div className="absolute inset-0 bg-stone-400/20" />
                          </div>
                          {/* Divider line & sweeping shimmer highlight */}
                          <div className="absolute inset-y-0 left-1/2 w-px bg-white/80 z-10" />
                          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center justify-center h-full">
                            <div className="w-[3px] h-full bg-linear-to-b from-transparent via-amber-300 to-transparent animate-sweep-divider shadow-[0_0_8px_#F59E0B]" />
                          </div>
                        </div>
                      ) : (
                        <span>{member.avatarInitial || member.name.charAt(0)}</span>
                      )}

                      {/* Full Leave: Small icon-only moon badge on corner (no text overlapping initial) */}
                      {isFullLeave && (
                        <div
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs ring-2 ring-white z-20"
                          title={`${member.name} • Away (Full Day Leave)`}
                        >
                          <Moon className="w-2.5 h-2.5 fill-current" />
                        </div>
                      )}

                      {/* Half Leave: Small icon-only half-circle badge on corner */}
                      {isHalfLeave && (
                        <div
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#1E3558] text-amber-300 flex items-center justify-center shadow-xs ring-2 ring-white z-20"
                          title={`${member.name} • Half Day Leave`}
                        >
                          <svg className="w-3 h-3 text-amber-300" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" />
                            <path d="M12 3 A 9 9 0 0 1 12 21 Z" fill="currentColor" />
                          </svg>
                        </div>
                      )}

                      {/* Normal Present Member Indicator */}
                      {!isFullLeave && !isHalfLeave && (
                        <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-[#1A1A1A] truncate w-full text-center">
                      {member.name}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* =========================================================================
            BOX 2 (Top-Right): "Clients"
            - Up to 5 client cards with a colored dot per department
            - "+N more" if over 5
            - Tap target that navigates to /clients
            ========================================================================= */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => navigate('/clients')}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/clients')}
          className="rounded-3xl p-6 lg:p-7 bg-white border-2 border-[#E8E5DD] shadow-xs flex flex-col justify-between overflow-hidden relative hover:border-[#2B4C7E] hover:shadow-md cursor-pointer transition-all duration-200 group active:scale-[0.995]"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#EBF1F8] text-[#2B4C7E] flex items-center justify-center font-black">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg lg:text-xl font-black text-[#1E3558] uppercase tracking-wider">
                  Clients
                </h2>
                <p className="text-xs font-bold text-[#4B5563]">Active Accounts & Engagements</p>
              </div>
            </div>
            <span className="text-xs font-black text-[#1E3558] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
              <span>View All</span>
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>

          {/* Up to 4 Client Cards (compact layout to prevent overflow on any screen) */}
          <div className="flex-1 min-h-0 overflow-hidden space-y-1.5 my-auto py-1">
            {displayClients.map((client) => {
              // Find tasks for this client to extract department dots
              const clientTasks = tasks.filter((t) => {
                const cId = typeof t.client === 'object' && t.client ? t.client._id : t.client
                return cId === client._id || t.clientName === client.name
              })

              // Extract unique categories active on this client
              const activeCatsMap = new Map<string, CategoryStyle>()
              for (const t of clientTasks) {
                const cat = getCategoryStyle(t.category, t.title)
                if (!activeCatsMap.has(cat.id)) {
                  activeCatsMap.set(cat.id, cat)
                }
              }
              const clientCategories = Array.from(activeCatsMap.values())

              return (
                <div
                  key={client._id}
                  className="px-3 py-1.5 rounded-xl bg-[#F7F5F1] border border-[#E8E5DD] flex items-center justify-between gap-3 hover:bg-[#F2EFE8] transition-colors"
                >
                  <div className="min-w-0 flex-1 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white border border-[#DDD8CE] flex items-center justify-center font-black text-xs text-[#2B4C7E] shrink-0">
                      {client.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-[#1A1A1A] truncate leading-tight">
                          {client.name}
                        </h3>
                        <span
                          className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                            client.status === 'active'
                              ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                              : client.status === 'onboarding'
                              ? 'bg-amber-100 text-amber-950 border border-amber-300'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {client.status}
                        </span>
                      </div>
                      <p className="text-[10px] font-medium text-[#57534E] truncate">
                        {client.industry}
                      </p>
                    </div>
                  </div>

                  {/* Colored dot per department */}
                  <div
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-[#E0DCD3] shadow-2xs shrink-0"
                    title={`Active Departments: ${
                      clientCategories.length > 0
                        ? clientCategories.map((c) => c.label).join(', ')
                        : 'Onboarding Queue'
                    }`}
                  >
                    {clientCategories.length > 0 ? (
                      clientCategories.map((cat) => (
                        <span
                          key={cat.id}
                          className={`w-2 h-2 rounded-full ${cat.dotClass} ring-1 ring-white shrink-0`}
                          title={cat.label}
                        />
                      ))
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-stone-300 ring-1 ring-white" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Bottom Footer: Account count + Department Dot Legend Key */}
          <div className="pt-2 border-t border-[#F0EDE6] shrink-0 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-[#57534E]">
              <span>Active Accounts ({clients.length})</span>
              {remainingClientsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#EBF1F8] text-[#1E3558] border border-[#C7D9EC] text-[10px] font-black">
                  +{remainingClientsCount} More Accounts
                </span>
              )}
            </div>

            {/* Department Color Legend Key */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[9px] font-bold text-[#57534E]">
              <span className="text-[8px] uppercase tracking-wider text-[#8C827A] font-black">Dept:</span>
              <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />Social</span>
              <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#F47266] shrink-0" />Shoot</span>
              <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />Video</span>
              <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0" />Design</span>
              <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />Ads</span>
              <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />Meeting</span>
              <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />Web Dev</span>
              <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />App Dev</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            BOX 3 (Bottom-Left): "Today's Team Tasks"
            - Three big numbers (Done, Active, Review) for the whole team's tasks today
            - No list, just counts
            - Tap target that navigates to /team-view
            ========================================================================= */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => navigate('/team-view')}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/team-view')}
          className="rounded-3xl p-6 lg:p-7 bg-white border-2 border-[#E8E5DD] shadow-xs flex flex-col justify-between overflow-hidden relative hover:border-[#2B4C7E] hover:shadow-md cursor-pointer transition-all duration-200 group active:scale-[0.995]"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#EBF1F8] text-[#2B4C7E] flex items-center justify-center font-black">
                <CheckSquare className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg lg:text-xl font-black text-[#1E3558] uppercase tracking-wider">
                  Today's Team Tasks
                </h2>
                <p className="text-xs font-bold text-[#4B5563]">All Departments Aggregate</p>
              </div>
            </div>
            <span className="text-xs font-black text-[#1E3558] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
              <span>Open Team View</span>
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>

          {/* Three Big Numbers (Done, Active, Review) - No list, just counts */}
          <div className="my-auto grid grid-cols-3 gap-2.5 lg:gap-3.5 py-1">
            {/* 1. Done */}
            <div className="p-3 lg:p-4 rounded-2xl bg-emerald-50/70 border-2 border-emerald-200 text-center flex flex-col justify-center items-center">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-950">
                Done
              </span>
              <span className="text-4xl lg:text-5xl xl:text-6xl font-black text-emerald-700 my-0.5 leading-tight tracking-tight">
                {doneCount}
              </span>
              <span className="text-[10px] lg:text-[11px] font-bold text-emerald-900">
                {Math.round((doneCount / (tasks.length || 1)) * 100)}% resolved
              </span>
            </div>

            {/* 2. Active */}
            <div className="p-3 lg:p-4 rounded-2xl bg-[#EBF1F8] border-2 border-[#C7D9EC] text-center flex flex-col justify-center items-center">
              <span className="text-xs font-black uppercase tracking-wider text-[#1E3558]">
                Active
              </span>
              <span className="text-4xl lg:text-5xl xl:text-6xl font-black text-[#1E3558] my-0.5 leading-tight tracking-tight">
                {activeCount}
              </span>
              <span className="text-[10px] lg:text-[11px] font-bold text-[#2B4C7E]">
                In-flight sprints
              </span>
            </div>

            {/* 3. Review */}
            <div className="p-3 lg:p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-200 text-center flex flex-col justify-center items-center">
              <span className="text-xs font-black uppercase tracking-wider text-amber-950">
                Review
              </span>
              <span className="text-4xl lg:text-5xl xl:text-6xl font-black text-amber-800 my-0.5 leading-tight tracking-tight">
                {reviewCount}
              </span>
              <span className="text-[10px] lg:text-[11px] font-bold text-amber-900">
                QA & revisions
              </span>
            </div>
          </div>

          {/* Footer Metrics */}
          <div className="pt-2 border-t border-[#F0EDE6] flex items-center justify-between text-xs font-semibold text-[#57534E]">
            <span>
              Total Assigned Across Team: <strong className="text-[#1A1A1A] font-black">{tasks.length}</strong>
            </span>
            <span className="text-[#2B4C7E] font-bold">Live across Digital & Dev</span>
          </div>
        </div>

        {/* =========================================================================
            BOX 4 (Bottom-Right): Character Image + Daily Quote
            - here.png character image
            - Daily quote text below it
            - No navigation on tap
            ========================================================================= */}
        <div
          id="debug-box-4"
          className="rounded-3xl p-6 lg:p-7 bg-white border-2 border-[#E8E5DD] shadow-xs flex flex-col justify-between overflow-hidden relative cursor-default"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#EBF1F8] text-[#2B4C7E] flex items-center justify-center font-black">
                <Sparkles className="w-4 h-4 text-[#2B4C7E]" />
              </div>
              <div>
                <h2 className="text-lg lg:text-xl font-black text-[#1E3558] uppercase tracking-wider">
                  Studio Culture
                </h2>
                <p className="text-xs font-bold text-[#4B5563]">Daily Inspiration & Presence</p>
              </div>
            </div>

            {/* Rotation mode toggle / status badge */}
            <button
              type="button"
              onClick={() => setIsRotatingQuotes((prev) => !prev)}
              title="Click to toggle between auto-rotating every 45s and fixed Quote of the Day"
              className="text-[11px] font-mono font-bold uppercase text-[#1E3558] px-2.5 py-1 rounded-full bg-[#EBF1F8] border border-[#C7D9EC] hover:bg-[#DDE7F3] transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isRotatingQuotes ? 'bg-emerald-500 animate-pulse' : 'bg-[#1E3558]'
                }`}
              />
              <span>
                {isRotatingQuotes
                  ? `Rotating #${quoteIndex + 1}/${quotes.length}`
                  : 'Quote of the Day'}
              </span>
            </button>
          </div>

          {/* Character Image (here.png) */}
          <div
            id="debug-character-container"
            className="flex-1 flex items-center justify-center py-1 min-h-0 overflow-hidden"
          >
            <img
              id="debug-character-img"
              src="/here.png"
              alt="Inkdabba Studio Host"
              className="max-h-[110px] sm:max-h-[125px] lg:max-h-[145px] object-contain drop-shadow-md mx-auto shrink"
            />
          </div>

          {/* Clean, readable quote text beneath here.png */}
          <div
            id="debug-quote-card"
            onClick={() => setQuoteIndex((prev) => (prev + 1) % quotes.length)}
            title="Click to cycle next quote"
            className="shrink-0 mt-auto p-3.5 lg:p-4 rounded-2xl bg-[#F7F5F1] border-2 border-[#E8E5DD] text-center hover:bg-[#F2EFE8] transition-all cursor-pointer group shadow-2xs"
          >
            <p id="debug-quote-text" className="text-sm lg:text-base font-bold text-[#1A1A1A] italic leading-snug">
              "{quoteText}"
            </p>
            <p id="debug-quote-author" className="text-xs font-bold text-[#4B5563] mt-1.5 uppercase tracking-wider">
              — {quoteAuthor}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TVRoute
