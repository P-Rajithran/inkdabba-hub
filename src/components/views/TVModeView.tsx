import { useState, useEffect } from 'react'
import type React from 'react'
import {
  Maximize2,
  Minimize2,
} from 'lucide-react'
import type { Task, Metric } from '../../types'

interface TVModeViewProps {
  tasks: Task[]
  metrics: Metric[]
}

export const TVModeView: React.FC<TVModeViewProps> = ({ tasks, metrics }) => {
  const [time, setTime] = useState<string>('')
  const [date, setDate] = useState<string>('')
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      )
      setDate(
        now.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      )
    }

    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  const activeJobs = tasks.filter((t) => !t.completed)

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Top TV Bar: Live Clock & Fullscreen toggle */}
      <div className="bg-white border-2 border-[#2B4C7E]/20 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#2B4C7E]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
            </span>
            <span>Studio Floor Monitor • Live Broadcast</span>
          </div>
          <div className="font-mono text-4xl lg:text-5xl font-bold tracking-tight text-[#1A1A1A]">
            {time || '--:--:--'}
          </div>
          <p className="text-sm font-medium text-[#6B6862]">{date}</p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-2.5 px-5 py-3 bg-[#2B4C7E] text-white rounded-2xl text-sm font-bold hover:bg-[#213C64] transition-all shadow-sm"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4" />
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4" />
                <span>Enter TV Fullscreen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Large Stats Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className="bg-white border border-[#E8E5DD] rounded-3xl p-7 shadow-xs flex flex-col justify-between"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-[#6B6862]">
              {metric.label}
            </span>
            <div className="my-3 text-4xl lg:text-5xl font-extrabold text-[#1A1A1A]">
              {metric.value}
            </div>
            <div className="text-xs font-semibold text-[#2B4C7E] bg-[#EBF1F8] px-2.5 py-1 rounded-lg w-fit">
              {metric.caption}
            </div>
          </div>
        ))}
      </div>

      {/* Big Screen Job Queue */}
      <div className="bg-white border border-[#E8E5DD] rounded-3xl p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#E8E5DD] pb-4">
          <h3 className="text-xl font-bold text-[#1A1A1A]">
            Floor Priorities & Live Orders ({activeJobs.length})
          </h3>
          <span className="text-xs font-mono font-semibold text-[#8C827A]">
            AUTO-REFRESH: 15s
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeJobs.map((job) => (
            <div
              key={job.id}
              className="p-5 rounded-2xl bg-[#F7F5F1] border border-[#E8E5DD] flex items-start justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-lg ${
                      job.priority === 'urgent'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-[#EAE6DD] text-[#57534E]'
                    }`}
                  >
                    {job.priority}
                  </span>
                  <span className="text-xs font-semibold text-[#6B6862]">
                    {job.category}
                  </span>
                </div>
                <h4 className="text-base font-bold text-[#1A1A1A] leading-snug">
                  {job.title}
                </h4>
                <p className="text-xs font-mono text-[#8C827A]">
                  Assigned: {job.assignedTo || 'Floor Team'}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <span className="inline-block px-3 py-1 bg-white border border-[#E8E5DD] rounded-xl text-xs font-mono font-bold text-[#1A1A1A]">
                  {job.dueTime}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
