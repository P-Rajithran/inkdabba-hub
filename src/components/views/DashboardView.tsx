import type React from 'react'
import {
  Clock,
  Layers,
  ArrowRight,
  Package,
} from 'lucide-react'
import type { Metric } from '../../types'

interface DashboardViewProps {
  metrics: Metric[]
  onNavigateToTasks: () => void
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  onNavigateToTasks,
}) => {
  return (
    <div className="space-y-10 animate-fade-in">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className="bg-white border border-[#E8E5DD] rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-[#D4DFEE] transition-colors"
          >
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6862]">
                {metric.label}
              </span>
              <div className="mt-3 text-3xl lg:text-4xl font-bold tracking-tight text-[#1A1A1A]">
                {metric.value}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#F0EDE6] flex items-center justify-between text-xs">
              <span className="font-semibold text-[#2B4C7E] bg-[#EBF1F8] px-2 py-0.5 rounded">
                {metric.change}
              </span>
              <span className="text-[#8C827A] truncate ml-2">
                {metric.caption}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Production Pipeline & Real-Time Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Active Print Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#1A1A1A]">Live Job Pipeline</h3>
              <p className="text-xs text-[#6B6862]">Active production orders running through the studio</p>
            </div>
            <button
              onClick={onNavigateToTasks}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#2B4C7E] hover:underline"
            >
              View all tasks <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white border border-[#E8E5DD] rounded-2xl p-6 shadow-xs space-y-6">
            {/* Step 1: Prepress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1A1A1A] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#EBF1F8] text-[#2B4C7E] flex items-center justify-center font-bold text-xs">1</span>
                  Prepress & Proofing
                </span>
                <span className="font-mono text-[#6B6862]">3 jobs queued</span>
              </div>
              <div className="w-full bg-[#F0EDE6] h-2 rounded-full overflow-hidden">
                <div className="bg-[#2B4C7E] h-full rounded-full w-[65%]"></div>
              </div>
              <div className="flex justify-between text-[11px] text-[#8C827A]">
                <span>Latest: Studio K Stationery (Pantone Warm Red)</span>
                <span>Est. completion: 40 mins</span>
              </div>
            </div>

            {/* Step 2: Press Run */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1A1A1A] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#EBF1F8] text-[#2B4C7E] flex items-center justify-center font-bold text-xs">2</span>
                  Offset & Digital Press
                </span>
                <span className="font-mono text-[#6B6862]">5 jobs running</span>
              </div>
              <div className="w-full bg-[#F0EDE6] h-2 rounded-full overflow-hidden">
                <div className="bg-[#2B4C7E] h-full rounded-full w-[88%]"></div>
              </div>
              <div className="flex justify-between text-[11px] text-[#8C827A]">
                <span>Latest: Luxe Hardcover Sleeves (Batch #804)</span>
                <span>Est. completion: 1.2 hrs</span>
              </div>
            </div>

            {/* Step 3: Finishing & Binding */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1A1A1A] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#EBF1F8] text-[#2B4C7E] flex items-center justify-center font-bold text-xs">3</span>
                  Foil, Die-Cut & Packaging
                </span>
                <span className="font-mono text-[#6B6862]">2 jobs in finishing</span>
              </div>
              <div className="w-full bg-[#F0EDE6] h-2 rounded-full overflow-hidden">
                <div className="bg-[#2B4C7E] h-full rounded-full w-[42%]"></div>
              </div>
              <div className="flex justify-between text-[11px] text-[#8C827A]">
                <span>Latest: Coffee Blend Foil-Stamped Labels</span>
                <span>Est. completion: 2.5 hrs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Studio Highlights */}
        <div className="space-y-6">
          <div className="bg-white border border-[#E8E5DD] rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#1A1A1A]">Studio Highlights</h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F7F5F1] border border-[#E8E5DD]">
                <Package className="w-4 h-4 text-[#2B4C7E] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#1A1A1A] block">Batch #799 Dispatched</span>
                  <span className="text-[#6B6862]">Picked up by BlueDart Express at 09:45 AM. Tracking shared with client.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F7F5F1] border border-[#E8E5DD]">
                <Layers className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#1A1A1A] block">Color Delta &lt; 1.2 Achieved</span>
                  <span className="text-[#6B6862]">Spectrophotometer verification passed for luxury cosmetic packaging run.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F7F5F1] border border-[#E8E5DD]">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#1A1A1A] block">Scheduled Maintenance at 18:00</span>
                  <span className="text-[#6B6862]">Preventive wash and blanket check for Heidelberg press.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
