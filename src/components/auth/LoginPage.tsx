import { useState } from 'react'
import type React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowRight, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { API_BASE } from '../../services/api'

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect target after login (defaults to /dashboard)
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError('Please enter your email and password')
      return
    }

    try {
      setIsSubmitting(true)
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Login failed')
      }

      // Store JWT and user context
      login(data.token, data.user)
      window.dispatchEvent(new Event('inkdabba:show-splash'))
      navigate(from, { replace: true })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid credentials')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Quick fill helper for review and evaluation
  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword('password123')
    setError(null)
  }

  return (
    <div className="min-h-screen bg-[#F7F5F1] text-[#1A1A1A] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-[#2B4C7E] selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* ID Brand Mark */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-[#2B4C7E] text-white flex items-center justify-center font-extrabold text-2xl shadow-sm tracking-tight">
            ID
          </div>
        </div>

        <h2 className="text-center text-3xl font-extrabold tracking-tight text-[#1A1A1A]">
          Sign in to inkdabba-hub
        </h2>
        <p className="mt-1 text-center text-xs text-[#6B6862]">
          Digital Marketing & Dev Agency Studio Operations
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xs border border-[#E8E5DD] rounded-3xl space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-[#57534E]"
              >
                Email address
              </label>
              <div className="mt-1.5">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@inkdabba.com"
                  className="block w-full px-4 py-3 bg-[#F7F5F1] border border-[#E8E5DD] rounded-xl text-sm text-[#1A1A1A] placeholder-[#8C827A] focus:outline-hidden focus:border-[#2B4C7E] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider text-[#57534E]"
                >
                  Password
                </label>
              </div>
              <div className="mt-1.5">
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full px-4 py-3 bg-[#F7F5F1] border border-[#E8E5DD] rounded-xl text-sm text-[#1A1A1A] placeholder-[#8C827A] focus:outline-hidden focus:border-[#2B4C7E] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-[#2B4C7E] hover:bg-[#213C64] disabled:opacity-50 text-white font-bold px-4 py-3.5 rounded-xl text-sm transition-all shadow-xs active:scale-[0.99] cursor-pointer"
            >
              <span>{isSubmitting ? 'Signing in...' : 'Sign in to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="pt-4 border-t border-[#F0EDE6] space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#8C827A]">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#2B4C7E]" /> Quick Demo Access
              </span>
              <span className="text-[10px] font-normal lowercase">(password123)</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('prakash@inkdabba.com')}
                className="px-3 py-2 text-xs font-semibold text-[#2B4C7E] bg-[#EBF1F8] border border-[#C7D9EC] rounded-xl hover:bg-[#DDE9F5] transition-colors text-left truncate cursor-pointer"
              >
                <span className="block font-bold">Prakash</span>
                <span className="text-[10px] text-[#6B6862]">Client Coordinator (Admin)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('aswin@inkdabba.com')}
                className="px-3 py-2 text-xs font-semibold text-[#1A1A1A] bg-[#F7F5F1] border border-[#E8E5DD] rounded-xl hover:bg-[#EFECE6] transition-colors text-left truncate cursor-pointer"
              >
                <span className="block font-bold">Aswin</span>
                <span className="text-[10px] text-[#6B6862]">Social Media Exec (Member)</span>
              </button>
            </div>
          </div>

          <div className="text-center pt-2 text-xs text-[#6B6862]">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-[#2B4C7E] hover:underline">
              Create an account
            </Link>
          </div>
        </div>

        {/* Minimal status indicator footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#8C827A]">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Secured with JWT (7-day validity) and bcrypt hashing</span>
        </div>
      </div>
    </div>
  )
}
