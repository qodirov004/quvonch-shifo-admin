"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: number
  username: string
  is_superuser: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    
    // Check if user is already logged in
    const checkAuth = () => {
      // Only run on client side
      if (typeof window === 'undefined') return
      
      try {
        const storedToken = localStorage.getItem("adminToken")
        const storedUser = localStorage.getItem("user")

        if (storedToken && storedUser) {
          const userData = JSON.parse(storedUser)
          setToken(storedToken)
          setUser(userData)
        }
      } catch (error) {
        console.error("Error parsing stored user:", error)
        localStorage.removeItem("adminToken")
        localStorage.removeItem("user")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("adminToken")
      localStorage.removeItem("user")
    }
    setToken(null)
    setUser(null)
    router.push("/login")
  }

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
