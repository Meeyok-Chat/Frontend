"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import { useEffect, useState } from "react"

type Friend = {
  id: string
  name: string
  avatar: string
  status: "online" | "away" | "offline"
  lastSeen?: Date
}

export function FriendsList() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching friends
    setTimeout(() => {
      const mockFriends: Friend[] = [
        {
          id: "user1",
          name: "Alex Johnson",
          avatar: "/placeholder.svg?height=40&width=40",
          status: "online",
        },
        {
          id: "user2",
          name: "Sam Wilson",
          avatar: "/placeholder.svg?height=40&width=40",
          status: "online",
        },
        {
          id: "user3",
          name: "Taylor Smith",
          avatar: "/placeholder.svg?height=40&width=40",
          status: "offline",
          lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        },
        {
          id: "user4",
          name: "Jordan Lee",
          avatar: "/placeholder.svg?height=40&width=40",
          status: "away",
        },
      ]

      setFriends(mockFriends)
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

  if (friends.length === 0) {
    return (
      <div className="text-center py-4 text-slate-500">
        <p>No friends yet</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[200px]">
      <div className="space-y-2">
        {friends.map((friend) => (
          <Link key={friend.id} href={`/chat/user/${friend.id}`}>
            <Button variant="ghost" className="w-full justify-start p-2 h-auto">
              <div className="flex items-center gap-3 w-full">
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={friend.avatar || "/placeholder.svg"} alt={friend.name} />
                    <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span
                    className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-1 ring-white ${
                      friend.status === "online"
                        ? "bg-green-500"
                        : friend.status === "away"
                          ? "bg-yellow-500"
                          : "bg-slate-300"
                    }`}
                  />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate">{friend.name}</p>
                  <p className="text-xs text-slate-500">
                    {friend.status === "online"
                      ? "Online"
                      : friend.status === "away"
                        ? "Away"
                        : friend.lastSeen
                          ? `Last seen ${formatLastSeen(friend.lastSeen)}`
                          : "Offline"}
                  </p>
                </div>
              </div>
            </Button>
          </Link>
        ))}
      </div>
    </ScrollArea>
  )
}

function formatLastSeen(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 60) {
    return `${diffMins} min ago`
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
  } else {
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
  }
}
