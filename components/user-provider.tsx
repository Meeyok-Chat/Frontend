"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

type User = {
  id: string
  displayName: string
  email?: string
  isGuest: boolean
}

type UserContextType = {
  user: User | null
  setUser: (user: User | null) => void
  isAuthenticated: boolean
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  isAuthenticated: false,
})

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const isAuthenticated = !!user && !user.isGuest

  // Simulate loading user data
  useEffect(() => {
    // In a real app, you would check for a session or token
    const mockUser: User = {
      id: "user123",
      displayName: "John Doe",
      email: "john@example.com",
      isGuest: false,
    }

    setUser(mockUser)
  }, [])

  return <UserContext.Provider value={{ user, setUser, isAuthenticated }}>{children}</UserContext.Provider>
}

export const useUser = () => useContext(UserContext)
