import { createContext } from 'react'
import type { AuthUser } from '../types'

export interface AuthContextType {
  token: string | null
  currentUser: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, userData?: Partial<AuthUser>) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Safely decodes JWT payload in browser and verifies expiration
 */
export function decodeJwt(token: string): AuthUser | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )

    const payload = JSON.parse(jsonPayload)

    // Check expiration if exp field exists
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null
    }

    return {
      id: payload.id,
      role: payload.role || 'member',
      name: payload.name,
      email: payload.email,
      exp: payload.exp,
      iat: payload.iat,
    }
  } catch {
    return null
  }
}
