"use client"

import { fetchClient } from "@/lib/api/client"
import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

type User = {
  id?: string
  username?: string
  email?: string
}

type UserContextType = {
  user: User | null
  setUser: (user: User | null) => void
  isAuthenticated: boolean
  loading: boolean
  refetchUser: () => void
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: false,
  setUser: () => { },
  refetchUser: () => { },
  isAuthenticated: false,
})

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const isAuthenticated = !!user //&& !user.isGuest

  const fetchUser = async () => {
    setLoading(true)
    try {
      const response = await fetchClient.GET("/users/me")
      if (!response.data) throw new Error(response.error.message)

      setUser(response.data)
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally{
      setLoading(false)
    }
  }

  // Simulate loading user data
  useEffect(() => {
    fetchUser()
  }, [])

  return <UserContext.Provider value={{ user, setUser, refetchUser: fetchUser, isAuthenticated, loading }}>{children}</UserContext.Provider>
}

export const useUser = () => useContext(UserContext)
