import { useState } from 'react'
import type React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { API_BASE } from '../../services/api'

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'member' | 'admin'>('member')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Please enter your full name')
      return
    }

    if (!email.trim()) {
      setError('Please enter a valid email')
      return
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      setIsSubmitting(true)
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Registration failed')
      }

      // Store token and redirect to /dashboard
      login(data.token, data.user)
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F5F1] text-[#1A1A1A] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-[#2B4C7E] selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Mark */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-[#2B4C7E] text-white flex items-center justify-center font-extrabold text-2xl shadow-sm tracking-tight">
            ID
          </div>
        </div>

        <h2 className="text-center text-3xl font-extrabold tracking-tight text-[#1A1A1A]">
          Create inkdabba account
        </h2>
        <p className="mt-1 text-center text-xs text-[#6B6862]">
          Register a new operator or admin profile for studio workflow
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
                htmlFor="name"
                className="block text-xs font-bold uppercase tracking-wider text-[#57534E]"
              >
                Full name
              </label>
              <div className="mt-1.5">
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Varma"
                  className="block w-full px-4 py-3 bg-[#F7F5F1] border border-[#E8E5DD] rounded-xl text-sm text-[#1A1A1A] placeholder-[#8C827A] focus:outline-hidden focus:border-[#2B4C7E] focus:bg-white transition-colors"
                />
              </div>
            </div>

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
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maya@inkdabba.com"
                  className="block w-full px-4 py-3 bg-[#F7F5F1] border border-[#E8E5DD] rounded-xl text-sm text-[#1A1A1A] placeholder-[#8C827A] focus:outline-hidden focus:border-[#2B4C7E] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-[#57534E]"
              >
                Password (min 6 characters)
              </label>
              <div className="mt-1.5">
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full px-4 py-3 bg-[#F7F5F1] border border-[#E8E5DD] rounded-xl text-sm text-[#1A1A1A] placeholder-[#8C827A] focus:outline-hidden focus:border-[#2B4C7E] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-xs font-bold uppercase tracking-wider text-[#57534E]"
              >
                Initial Account Role
              </label>
              <div className="mt-1.5">
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'member' | 'admin')}
                  className="block w-full px-4 py-3 bg-[#F7F5F1] border border-[#E8E5DD] rounded-xl text-sm text-[#1A1A1A] focus:outline-hidden focus:border-[#2B4C7E] focus:bg-white transition-colors font-medium"
                >
                  <option value="member">Member (Operator / Studio Floor)</option>
                  <option value="admin">Admin (Full Access & All Task Management)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-[#2B4C7E] hover:bg-[#213C64] disabled:opacity-50 text-white font-bold px-4 py-3.5 rounded-xl text-sm transition-all shadow-xs active:scale-[0.99] cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating account...' : 'Create Account & Continue'}</span>
            </button>
          </form>

          <div className="text-center pt-2 text-xs text-[#6B6862]">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#2B4C7E] hover:underline">
              Sign in
            </Link>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#8C827A]">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Automatic 7-day JWT authentication with bcrypt password hashing</span>
        </div>
      </div>
    </div>
  )
}
