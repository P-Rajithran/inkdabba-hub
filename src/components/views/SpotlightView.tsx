import { useState, useEffect } from 'react'
import type React from 'react'
import {
  Trophy,
  Medal,
  Award,
  Calendar,
  Sparkles,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react'
import { fetchLeaderboardApi } from '../../services/api'
import type { LeaderboardEntry } from '../../services/api'

type DateRange = 'day' | 'week' | 'month'

export const SpotlightView: React.FC = () => {
  const [range, setRange] = useState<DateRange>('week')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [totalCompleted, setTotalCompleted] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    let ignore = false

    async function loadLeaderboard() {
      setIsLoading(true)
      try {
        const data = await fetchLeaderboardApi(range)
        if (!ignore) {
          setLeaderboard(data.leaderboard || [])
          setTotalCompleted(data.totalCompleted || 0)
        }
      } catch (err) {
        console.error('Failed to load leaderboard data:', err)
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    loadLeaderboard()

    return () => {
      ignore = true
    }
  }, [range])

  const top1 = leaderboard[0]
  const top2 = leaderboard[1]
  const top3 = leaderboard[2]
  const restOfTeam = leaderboard.slice(3)

  const rangeLabels: Record<DateRange, { label: string; sub: string }> = {
    day: { label: 'Today', sub: 'Tasks completed today' },
    week: { label: 'This Week', sub: 'Tasks completed over past 7 days' },
    month: { label: 'This Month', sub: 'Tasks completed over past 30 days' },
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header & Range Toggle */}
      <div className="bg-white border border-[#E8E5DD] rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#EBF1F8] text-[#2B4C7E]">
                <Trophy className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A1A1A]">
                Studio Spotlight & Leaderboard
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#6B6862]">
              Recognizing high-volume production output, quality sign-offs, and press floor milestones
            </p>
          </div>

          {/* Day / Week / Month Toggle */}
          <div className="flex items-center gap-1.5 p-1.5 bg-[#F7F5F1] border border-[#E8E5DD] rounded-2xl self-start md:self-auto shrink-0">
            {(['day', 'week', 'month'] as DateRange[]).map((r) => {
              const active = range === r
              return (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all capitalize cursor-pointer ${
                    active
                      ? 'bg-[#2B4C7E] text-white shadow-xs scale-102'
                      : 'text-[#6B6862] hover:text-[#1A1A1A] hover:bg-[#EFECE6]'
                  }`}
                >
                  {r}
                </button>
              )
            })}
          </div>
        </div>

        {/* Range summary caption */}
        <div className="mt-5 pt-4 border-t border-[#F0EDE6] flex flex-wrap items-center justify-between gap-3 text-xs text-[#8C827A]">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#2B4C7E]" />
            <span className="font-semibold text-[#1A1A1A]">{rangeLabels[range].sub}</span>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              <strong className="text-[#1A1A1A]">{totalCompleted}</strong> jobs completed across studio
            </span>
          </div>
        </div>
      </div>

      {/* Top 3 as Prominent Ranked Cards (1st larger and brighter than 2nd & 3rd) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2B4C7E]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#6B6862]">
              Top 3 Production Leaders ({rangeLabels[range].label})
            </h2>
          </div>
          <span className="text-[11px] font-mono text-[#8C827A]">Ranked by completed jobs</span>
        </div>

        {isLoading ? (
          <div className="bg-white border border-[#E8E5DD] rounded-3xl p-16 text-center text-[#8C827A] text-xs shadow-xs">
            <div className="w-6 h-6 border-2 border-[#2B4C7E] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Aggregating production output...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {/* 2nd Place Card (Runner Up - Silver) */}
            {top2 && (
              <div className="md:order-1 bg-white border border-[#D5DFEA] rounded-3xl p-6 shadow-xs flex flex-col items-center text-center relative overflow-hidden transition-all hover:border-[#2B4C7E]/40">
                <div className="absolute top-4 left-4 inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
                  <Medal className="w-3.5 h-3.5 text-slate-500" />
                  #2 Silver
                </div>

                <div className="mt-8 mb-3 w-16 h-16 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-xl font-black text-slate-700 ring-4 ring-slate-50 shadow-xs">
                  {top2.name.charAt(0)}
                </div>

                <h3 className="text-lg font-bold text-[#1A1A1A] truncate w-full">{top2.name}</h3>
                <span className="text-xs text-[#6B6862] capitalize mt-0.5">{top2.role}</span>

                <div className="my-5 py-3 px-6 rounded-2xl bg-[#F7F5F1] w-full border border-[#E8E5DD]">
                  <div className="text-3xl font-extrabold text-[#1A1A1A]">{top2.count}</div>
                  <div className="text-[11px] font-semibold text-[#8C827A] uppercase tracking-wider mt-0.5">
                    Tasks Completed ({top2.points} pts)
                  </div>
                </div>

                <div className="text-[11px] text-[#8C827A] flex items-center gap-1 font-medium">
                  <TrendingUp className="w-3 h-3 text-slate-500" />
                  <span>Runner-up performance</span>
                </div>
              </div>
            )}

            {/* 1st Place Card (Champion - LARGER & BRIGHTER than 2nd and 3rd) */}
            {top1 && (
              <div className="md:order-2 bg-linear-to-b from-[#FFFDF5] via-white to-[#FDF8E8] border-2 border-amber-400 rounded-3xl p-8 sm:p-9 shadow-lg flex flex-col items-center text-center relative overflow-hidden transform md:-translate-y-2 md:scale-103 transition-all ring-4 ring-amber-100/60">
                {/* Gold Crown / Badge Ribbon */}
                <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                  <Trophy className="w-4 h-4 text-amber-600 fill-amber-500" />
                  #1 Shift Champion
                </div>

                {/* Larger Avatar */}
                <div className="mt-5 mb-3.5 w-22 h-22 rounded-full bg-linear-to-br from-amber-200 to-amber-400 border-4 border-amber-300 flex items-center justify-center text-3xl font-black text-amber-950 ring-8 ring-amber-100/80 shadow-md">
                  {top1.name.charAt(0)}
                </div>

                <h3 className="text-2xl font-black text-[#1A1A1A] tracking-tight truncate w-full">
                  {top1.name}
                </h3>
                <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider mt-1 px-2.5 py-0.5 rounded-md bg-amber-100/60">
                  {top1.role} • Studio Lead
                </span>

                {/* Prominent Score */}
                <div className="my-5 py-4 px-8 rounded-2xl bg-white border border-amber-300/80 w-full shadow-xs">
                  <div className="text-5xl font-black text-[#1A1A1A] tracking-tight">{top1.count}</div>
                  <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mt-1">
                    Completed Jobs ({top1.points} Points)
                  </div>
                </div>

                <div className="text-xs text-amber-900 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Top Studio Contributor this {range}</span>
                </div>
              </div>
            )}

            {/* 3rd Place Card (Podium - Bronze) */}
            {top3 && (
              <div className="md:order-3 bg-white border border-[#E9DFD3] rounded-3xl p-6 shadow-xs flex flex-col items-center text-center relative overflow-hidden transition-all hover:border-[#D4B28C]">
                <div className="absolute top-4 left-4 inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  <Award className="w-3.5 h-3.5 text-amber-700" />
                  #3 Bronze
                </div>

                <div className="mt-8 mb-3 w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-300 flex items-center justify-center text-xl font-black text-amber-800 ring-4 ring-amber-50/50 shadow-xs">
                  {top3.name.charAt(0)}
                </div>

                <h3 className="text-lg font-bold text-[#1A1A1A] truncate w-full">{top3.name}</h3>
                <span className="text-xs text-[#6B6862] capitalize mt-0.5">{top3.role}</span>

                <div className="my-5 py-3 px-6 rounded-2xl bg-[#F7F5F1] w-full border border-[#E8E5DD]">
                  <div className="text-3xl font-extrabold text-[#1A1A1A]">{top3.count}</div>
                  <div className="text-[11px] font-semibold text-[#8C827A] uppercase tracking-wider mt-0.5">
                    Tasks Completed ({top3.points} pts)
                  </div>
                </div>

                <div className="text-[11px] text-[#8C827A] flex items-center gap-1 font-medium">
                  <Medal className="w-3 h-3 text-amber-700" />
                  <span>Podium finisher</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* The Rest of the Team Below as a Simple Ranked List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#6B6862]">
            Team Standings (Rank 4+)
          </h2>
          <span className="text-xs text-[#8C827A]">
            {restOfTeam.length} other team members ranked
          </span>
        </div>

        <div className="bg-white border border-[#E8E5DD] rounded-3xl divide-y divide-[#E8E5DD] shadow-xs overflow-hidden">
          {restOfTeam.length > 0 ? (
            restOfTeam.map((member) => (
              <div
                key={member.userId}
                className="p-5 flex items-center justify-between gap-4 hover:bg-[#FDFBF7] transition-colors"
              >
                {/* Left: Rank + Avatar + Name */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-8 text-center font-mono font-bold text-sm text-[#8C827A] shrink-0">
                    #{member.rank}
                  </div>

                  <div className="w-10 h-10 rounded-full bg-[#F2EFE8] text-[#2B4C7E] flex items-center justify-center font-bold text-sm ring-2 ring-white shrink-0">
                    {member.name.charAt(0)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#1A1A1A] truncate">
                        {member.name}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#F2EFE8] text-[#57534E]">
                        {member.role}
                      </span>
                    </div>
                    <span className="text-xs text-[#8C827A] truncate block">{member.email}</span>
                  </div>
                </div>

                {/* Right: Point Count & Completed Tasks Pill */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-base font-extrabold text-[#1A1A1A]">
                      {member.count}
                    </span>
                    <span className="text-xs text-[#8C827A] ml-1">tasks</span>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-[#EBF1F8] text-[#2B4C7E] border border-[#C7D9EC] text-xs font-bold font-mono">
                    {member.points} pts
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-[#8C827A]">
              All registered operators are currently ranked in the Top 3 podium!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
