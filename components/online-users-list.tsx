"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import { useEffect, useState } from "react"

type OnlineUser = {
  id: string
  name: string
  avatar: string
  status: "online" | "away" | "offline"
}

export function OnlineUsersList() {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching online users
    setTimeout(() => {
      const mockUsers: OnlineUser[] = [
        { id: "user1", name: "Alex Johnson", avatar: "/placeholder.svg?height=40&width=40", status: "online" },
        { id: "user2", name: "Sam Wilson", avatar: "/placeholder.svg?height=40&width=40", status: "online" },
        { id: "user3", name: "Taylor Smith", avatar: "/placeholder.svg?height=40&width=40", status: "away" },
        { id: "user4", name: "Jordan Lee", avatar: "/placeholder.svg?height=40&width=40", status: "online" },
        { id: "user5", name: "Casey Brown", avatar: "/placeholder.svg?height=40&width=40", status: "online" },
      ]

      setOnlineUsers(mockUsers)
      setIsLoading(false)
    }, 1000)
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
      </div>
    )
  }

  if (onlineUsers.length === 0) {
    return <div className="text-center py-4 text-slate-500">No users online</div>
  }

  return (
    <ScrollArea className="h-[200px]">
      <div className="space-y-2">
        {onlineUsers.map((user) => (
          <Link key={user.id} href={`/chat/user/${user.id}`}>
            <Button variant="ghost" className="w-full justify-start p-2 h-auto">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span
                    className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-1 ring-white ${
                      user.status === "online"
                        ? "bg-green-500"
                        : user.status === "away"
                          ? "bg-yellow-500"
                          : "bg-slate-300"
                    }`}
                  />
                </div>
                <span>{user.name}</span>
              </div>
            </Button>
          </Link>
        ))}
      </div>
    </ScrollArea>
  )
}
