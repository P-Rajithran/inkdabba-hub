import { useState, useEffect } from 'react'
import type React from 'react'
import type { AuthUser } from '../types'
import { setAuthToken as syncApiToken } from '../services/api'
import { AuthContext, decodeJwt } from './authContextInstance'

const TOKEN_KEY = 'inkdabba_auth_token'
const USER_KEY = 'inkdabba_auth_user'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(TOKEN_KEY)
  })

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    if (typeof window === 'undefined') return null
    const savedToken = localStorage.getItem(TOKEN_KEY)
    if (!savedToken) return null

    const decoded = decodeJwt(savedToken)
    if (!decoded) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      return null
    }

    const savedUserMeta = localStorage.getItem(USER_KEY)
    if (savedUserMeta) {
      try {
        const meta = JSON.parse(savedUserMeta)
        return { ...decoded, ...meta }
      } catch {
        // ignore
      }
    }

    return decoded
  })

  const [isLoading] = useState<boolean>(false)

  // Sync token with API service
  useEffect(() => {
    syncApiToken(token)
  }, [token])

  const login = (newToken: string, userData?: Partial<AuthUser>) => {
    const decoded = decodeJwt(newToken)
    if (!decoded) {
      console.error('Invalid token supplied to login')
      return
    }

    const mergedUser: AuthUser = {
      ...decoded,
      ...(userData || {}),
    }

    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, JSON.stringify(mergedUser))
    syncApiToken(newToken)

    setToken(newToken)
    setCurrentUser(mergedUser)
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    syncApiToken(null)

    setToken(null)
    setCurrentUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        currentUser,
        isAuthenticated: Boolean(token && currentUser),
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
