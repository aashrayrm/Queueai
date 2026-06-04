// ============================================================
// AuthContext — QueueAI
// Stores the logged-in user and persists it in localStorage so
// a page refresh no longer logs the user out. Talks to the
// backend via the API client only.
// ============================================================

import React, { createContext, useContext, useState, useCallback } from 'react'

const STORAGE_KEY = 'queueai_auth'

const AuthContext = createContext(null)

// Read any previously stored session
const readStored = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(readStored) // { user: { id, email }, token }

  const login = useCallback((session) => {
    setAuth(session)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } catch {
      /* ignore storage errors */
    }
  }, [])

  const logout = useCallback(() => {
    setAuth(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore storage errors */
    }
  }, [])

  const value = {
    auth,
    userEmail: auth?.user?.email ?? null,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

export default AuthContext
