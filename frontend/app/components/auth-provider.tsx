"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface User {
  email: string
  name: string
  department: string | null
  role: string
  loginType: string
  loginTime: string
  rememberMe: boolean
  facultyId?: string | null
}

interface AuthContextType {
  user: User | null
  login: (userData: User, token: string, rememberMe: boolean) => void
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean // Add loading state to handle async validation
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true) // Add loading state
  const router = useRouter()

  // Base URL for the Express backend
  const API_BASE_URL = "https://exammarksmanagement.onrender.com"

  useEffect(() => {
    const validateToken = async () => {
      const token = typeof window !== "undefined" ? (window.localStorage.getItem("token") || window.sessionStorage.getItem("token")) : null
      const storedUser = typeof window !== "undefined" ? (window.localStorage.getItem("user") || window.sessionStorage.getItem("user")) : null

      if (token && storedUser) {
        try {
          // Validate token by calling the protected /api/users/profile endpoint
          const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (response.ok) {
            const userData = await response.json()
            if (userData.success) {
              // Map backend user data to your User interface
              const formattedUser: User = {
                email: userData.user.email,
                name: userData.user.name || "Unknown",
                department: userData.user.department || null,
                role: userData.user.role,
                loginType: userData.user.role, // Assuming role is the loginType
                loginTime: new Date().toISOString(), // You might want to store this at login
                rememberMe: !!window.localStorage.getItem("token"), // True if token is in localStorage
                facultyId: userData.user.facultyId || null,
              }
              setUser(formattedUser)
              setIsAuthenticated(true)
            } else {
              // Invalid token, clear storage and log out
              logout()
            }
          } else {
            logout()
          }
        } catch (error) {
          console.error("Token validation error:", error)
          logout()
        }
      }
      setIsLoading(false)
    }

    validateToken()
  }, [])

  const login = (userData: User, token: string, rememberMe: boolean) => {
    setUser(userData)
    setIsAuthenticated(true)
    if (typeof window !== "undefined") {
      // Store user data and token
      const storage = rememberMe ? window.localStorage : window.sessionStorage
      storage.setItem("user", JSON.stringify(userData))
      storage.setItem("token", token)
      // Clear the other storage to avoid conflicts
      const otherStorage = rememberMe ? window.sessionStorage : window.localStorage
      otherStorage.removeItem("user")
      otherStorage.removeItem("token")
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("user")
      window.localStorage.removeItem("token")
      window.sessionStorage.removeItem("user")
      window.sessionStorage.removeItem("token")
    }
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isLoading }}>
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