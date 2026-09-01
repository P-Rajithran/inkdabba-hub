import { useState } from 'react'
import type React from 'react'
import { CheckCircle2, Search, RotateCcw } from 'lucide-react'
import type { Task } from '../../types'

interface CompletedTasksViewProps {
  tasks: Task[]
  onReopenTask: (taskId: string) => void
}

export const CompletedTasksView: React.FC<CompletedTasksViewProps> = ({
  tasks,
  onReopenTask,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const completedList = tasks.filter((t) => t.completed || t.status === 'completed')

  const filtered = completedList.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1A1A1A]">Finished Assignments</h2>
          <p className="text-xs text-[#6B6862]">
            Audit trail of resolved quality checks, deliveries, and print runs
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search completed..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white border border-[#E8E5DD] rounded-xl text-xs text-[#1A1A1A] placeholder-[#8C827A] focus:outline-hidden focus:border-[#2B4C7E] w-56 sm:w-64"
          />
        </div>
      </div>

      {/* Completed Items Table / List */}
      <div className="bg-white border border-[#E8E5DD] rounded-2xl divide-y divide-[#E8E5DD] shadow-xs overflow-hidden">
        {filtered.map((task) => (
          <div
            key={task.id}
            className="p-5 flex items-start sm:items-center justify-between gap-4 hover:bg-[#FDFBF7] transition-colors"
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-[#F2EFE8] text-[#57534E]">
                    {task.category}
                  </span>
                  <span className="text-xs text-[#8C827A]">
                    Assigned: {task.assignedTo || 'Unassigned'}
                  </span>
                </div>

                <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                  {task.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right hidden sm:block">
                <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                  {task.completedAt ? `Done ${task.completedAt}` : 'Done today'}
                </span>
              </div>

              <button
                onClick={() => onReopenTask(task.id)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B6862] hover:text-[#2B4C7E] px-3 py-1.5 rounded-lg hover:bg-[#EFECE6] transition-colors"
                title="Move back to active"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reopen</span>
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-12 text-center text-[#57534E]">
            <img
              src="/hi.png"
              alt="No completed tasks"
              className="h-28 sm:h-36 w-auto object-contain mx-auto mb-3 drop-shadow-md"
            />
            <p className="text-base font-bold text-[#1A1A1A]">No completed tasks yet</p>
            <p className="text-xs text-[#57534E] mt-1 max-w-sm mx-auto">
              Completed items will be logged and archived here as sprint items wrap up.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
