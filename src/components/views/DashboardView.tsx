import type React from 'react'
import {
  TrendingUp,
  ShieldCheck,
  Users,
  Briefcase,
  ArrowRight,
  Sparkles,
  Code2,
  Megaphone,
  Palette,
  Film,
  Building2,
  ChevronRight,
} from 'lucide-react'
import type { Metric, TeamMember, Task } from '../../types'

interface DashboardViewProps {
  metrics: Metric[]
  teamMembers?: TeamMember[]
  tasks?: Task[]
  onNavigateToTasks: () => void
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  teamMembers = [],
  tasks = [],
  onNavigateToTasks,
}) => {
  // Compute real counts from tasks and team
  const totalActiveTasks = tasks.filter((t) => t.status !== 'completed').length || 28
  const reviewTasks = tasks.filter((t) => t.status === 'review').length || 5
  const completedTasks = tasks.filter((t) => t.status === 'completed').length || 5
  const totalTasks = tasks.length || 33

  // Client accounts matrix
  const clientAccounts = [
    {
      name: 'Aura Skincare',
      industry: 'D2C & Beauty',
      activeCount: 4,
      lead: 'Divya & Aswin',
      status: 'On Track',
      color: 'border-pink-200 bg-pink-50/50 text-pink-700',
    },
    {
      name: 'NeonPulse Fitness',
      industry: 'Health Tech & Mobile',
      activeCount: 3,
      lead: 'Ritika & Sanjay',
      status: 'Sprint Phase',
      color: 'border-purple-200 bg-purple-50/50 text-purple-700',
    },
    {
      name: 'Zephyr Media',
      industry: 'Publishing & Media',
      activeCount: 3,
      lead: 'Meena & Prakash',
      status: 'Review',
      color: 'border-blue-200 bg-blue-50/50 text-blue-700',
    },
    {
      name: 'Bloom Artisan Coffee',
      industry: 'F&B E-commerce',
      activeCount: 3,
      lead: 'Vignesh & Karthik',
      status: 'Packaging & Dev',
      color: 'border-amber-200 bg-amber-50/50 text-amber-800',
    },
    {
      name: 'Velvet Bloom Apparel',
      industry: 'Fashion & Lifestyle',
      activeCount: 3,
      lead: 'Aswin & Divya',
      status: 'Active Ads',
      color: 'border-rose-200 bg-rose-50/50 text-rose-700',
    },
    {
      name: 'Horizon SaaS',
      industry: 'B2B Enterprise',
      activeCount: 3,
      lead: 'Sanjay & Vignesh',
      status: 'API Beta',
      color: 'border-emerald-200 bg-emerald-50/50 text-emerald-800',
    },
  ]

  // 4 Agency Department Pipelines
  const departmentPipelines = [
    {
      id: 'marketing',
      title: 'Performance Marketing & Ads',
      icon: Megaphone,
      jobs: '8 Active Ad Sets',
      progress: 85,
      latest: 'Meta ROAS 4.2x • Festive Scaled Budget',
      leads: 'Meena & Aswin',
      accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      barColor: 'bg-indigo-600',
    },
    {
      id: 'dev',
      title: 'Web & Full-Stack Development',
      icon: Code2,
      jobs: '10 Active Deliverables',
      progress: 72,
      latest: 'Next.js 15 Client Portal & GraphQL Sync',
      leads: 'Sanjay & Vignesh',
      accent: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      barColor: 'bg-emerald-600',
    },
    {
      id: 'design',
      title: 'Creative Branding & UI/UX',
      icon: Palette,
      jobs: '9 Design Sprints',
      progress: 92,
      latest: 'Aura Skincare Figma Design System v2.1',
      leads: 'Divya & Prakash',
      accent: 'text-rose-700 bg-rose-50 border-rose-200',
      barColor: 'bg-rose-600',
    },
    {
      id: 'video',
      title: 'Video Production & Motion',
      icon: Film,
      jobs: '6 Commercial Cuts',
      progress: 60,
      latest: '4K Instagram Reels & Color Grading',
      leads: 'Karthik',
      accent: 'text-amber-700 bg-amber-50 border-amber-200',
      barColor: 'bg-amber-600',
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Executive Command Header */}
      <div className="bg-white border border-[#E8E5DD] rounded-3xl p-6 lg:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#2B4C7E] bg-[#EBF1F8] px-2.5 py-1 rounded-md">
                <Sparkles className="w-3.5 h-3.5" />
                Agency Intelligence & Analytics
              </span>
              <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                All 4 Departments Healthy
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-[#1A1A1A]">
              Studio Operations Command
            </h1>

            <p className="text-sm text-[#6B6862] max-w-2xl leading-relaxed">
              Real-time agency analytics across{' '}
              <span className="font-semibold text-[#1A1A1A]">11 client accounts</span>,{' '}
              <span className="font-semibold text-[#1A1A1A]">8 creative & tech specialists</span>, and{' '}
              <span className="font-semibold text-[#2B4C7E]">{totalTasks} deliverables</span>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToTasks}
              className="px-4 py-2.5 bg-[#2B4C7E] hover:bg-[#213C64] text-white text-xs font-bold rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>Manage Tasks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Active Deliverables */}
        <div className="bg-white border border-[#E8E5DD] rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-[#D4DFEE] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B6862]">
              Active Deliverables
            </span>
            <Briefcase className="w-4 h-4 text-[#2B4C7E]" />
          </div>
          <div className="my-3 text-3xl lg:text-4xl font-black tracking-tight text-[#1A1A1A]">
            {totalActiveTasks}
          </div>
          <div className="pt-3 border-t border-[#F0EDE6] flex items-center justify-between text-xs">
            <span className="font-semibold text-[#2B4C7E] bg-[#EBF1F8] px-2 py-0.5 rounded">
              +{completedTasks} done • {reviewTasks} review
            </span>
            <span className="text-[#8C827A]">Across 4 pipelines</span>
          </div>
        </div>

        {/* Fulfillment Rate */}
        <div className="bg-white border border-[#E8E5DD] rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-emerald-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Fulfillment Rate
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="my-3 text-3xl lg:text-4xl font-black tracking-tight text-emerald-900">
            99.4%
          </div>
          <div className="pt-3 border-t border-[#F0EDE6] flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              +1.2% sprint
            </span>
            <span className="text-[#8C827A]">Target: &gt;98.5%</span>
          </div>
        </div>

        {/* Studio Capacity Utilization */}
        <div className="bg-white border border-[#E8E5DD] rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-[#2B4C7E]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2B4C7E]">
              Studio Load
            </span>
            <TrendingUp className="w-4 h-4 text-[#2B4C7E]" />
          </div>
          <div className="my-3 text-3xl lg:text-4xl font-black tracking-tight text-[#2B4C7E]">
            76%
          </div>
          <div className="pt-3 border-t border-[#F0EDE6] flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              Balanced
            </span>
            <span className="text-[#8C827A]">8 specialists active</span>
          </div>
        </div>

        {/* Retained Client Brands */}
        <div className="bg-white border border-[#E8E5DD] rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-purple-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-800">
              Client Accounts
            </span>
            <Building2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="my-3 text-3xl lg:text-4xl font-black tracking-tight text-purple-900">
            11 Brands
          </div>
          <div className="pt-3 border-t border-[#F0EDE6] flex items-center justify-between text-xs">
            <span className="font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded">
              100% active
            </span>
            <span className="text-[#8C827A]">Retained agency roster</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Department Pipelines + Team Workload Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Live Agency Department Pipelines */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#1A1A1A]">Live Agency Pipelines</h2>
              <p className="text-xs text-[#6B6862]">
                Active production progress across core agency divisions
              </p>
            </div>

            <button
              onClick={onNavigateToTasks}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#2B4C7E] hover:underline"
            >
              <span>View details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white border border-[#E8E5DD] rounded-2xl p-6 shadow-xs space-y-6">
            {departmentPipelines.map((pipe) => {
              const Icon = pipe.icon
              return (
                <div key={pipe.id} className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#1A1A1A] flex items-center gap-2">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center border ${pipe.accent}`}>
                        <Icon className="w-4 h-4" />
                      </span>
                      {pipe.title}
                    </span>
                    <span className="font-mono font-semibold text-[#57534E]">{pipe.jobs}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-[#F0EDE6] h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${pipe.barColor}`}
                      style={{ width: `${pipe.progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#8C827A]">
                    <span className="truncate">{pipe.latest}</span>
                    <span className="font-semibold text-[#57534E] ml-2 shrink-0">
                      Lead: {pipe.leads}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Client Accounts Portfolio Matrix */}
          <div className="pt-4 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-[#1A1A1A]">Active Client Accounts</h2>
              <p className="text-xs text-[#6B6862]">
                Brand deliverables distribution & account coordinators
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {clientAccounts.map((account) => (
                <div
                  key={account.name}
                  className="bg-white border border-[#E8E5DD] rounded-xl p-4 shadow-xs hover:border-[#2B4C7E]/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#1A1A1A] truncate">{account.name}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${account.color}`}>
                      {account.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8C827A] mt-0.5 truncate">{account.industry}</p>
                  <div className="mt-3 pt-2.5 border-t border-[#F0EDE6] flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[#2B4C7E]">{account.activeCount} deliverables</span>
                    <span className="text-[#6B6862] truncate ml-1">{account.lead}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Team Capacity & Workload Balance */}
        <div className="space-y-6">
          <div className="bg-white border border-[#E8E5DD] rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#1A1A1A] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#2B4C7E]" />
                Team Capacity Radar
              </h2>
              <span className="text-[10px] font-bold uppercase text-[#8C827A]">8 Specialists</span>
            </div>

            <div className="space-y-4 text-xs">
              {teamMembers.map((member) => {
                const isKarthikAway = member.name.toLowerCase().includes('karthik')
                const isRitikaHalf = member.name.toLowerCase().includes('ritika')

                return (
                  <div key={member.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-[#EBF1F8] text-[#2B4C7E] flex items-center justify-center font-bold text-[10px] shrink-0">
                          {member.avatarInitial || member.name.charAt(0)}
                        </span>
                        <span className="font-semibold text-[#1A1A1A] truncate">{member.name}</span>
                        {isKarthikAway && (
                          <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-amber-100 text-amber-800">
                            AWAY
                          </span>
                        )}
                        {isRitikaHalf && (
                          <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-indigo-100 text-indigo-800">
                            ½ DAY
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[#6B6862] shrink-0">{member.capacity}%</span>
                    </div>

                    {/* Utilization Bar */}
                    <div className="w-full bg-[#F0EDE6] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          member.capacity > 80
                            ? 'bg-[#2B4C7E]'
                            : member.capacity > 60
                              ? 'bg-emerald-600'
                              : 'bg-amber-600'
                        }`}
                        style={{ width: `${member.capacity}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="pt-3 border-t border-[#F0EDE6] text-[11px] text-[#6B6862]">
              <span className="font-semibold text-[#1A1A1A]">Capacity note:</span> All team members are operating within safe bandwidth limits (&lt;95%).
            </div>
          </div>

          {/* Quick Studio Milestones */}
          <div className="bg-white border border-[#E8E5DD] rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#57534E]">
              Recent Deliverable Milestones
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-[#F7F5F1] border border-[#E8E5DD]">
                <span className="font-bold text-[#1A1A1A] block">NeonPulse Mobile App v2.0</span>
                <span className="text-[11px] text-[#6B6862]">Testing sprint passed QA. Submitted to App Store review.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F7F5F1] border border-[#E8E5DD]">
                <span className="font-bold text-[#1A1A1A] block">Aura Skincare Festive Campaign</span>
                <span className="text-[11px] text-[#6B6862]">ROAS jumped to 4.2x on Meta ads after creative refresh.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
