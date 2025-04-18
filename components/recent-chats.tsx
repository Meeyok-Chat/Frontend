"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import { useEffect, useState } from "react"

type ChatPreview = {
  id: string
  type: "private" | "group"
  name: string
  avatar: string
  lastMessage: string
  timestamp: Date
  unread: number
}

export function RecentChats() {
  const [chats, setChats] = useState<ChatPreview[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching recent chats
    setTimeout(() => {
      const mockChats: ChatPreview[] = [
        {
          id: "user1",
          type: "private",
          name: "Alex Johnson",
          avatar: "/placeholder.svg?height=40&width=40",
          lastMessage: "Hey, how are you doing?",
          timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
          unread: 2,
        },
        {
          id: "group1",
          type: "group",
          name: "Project Team",
          avatar: "/placeholder.svg?height=40&width=40",
          lastMessage: "Meeting at 3pm tomorrow",
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          unread: 0,
        },
        {
          id: "user2",
          type: "private",
          name: "Sam Wilson",
          avatar: "/placeholder.svg?height=40&width=40",
          lastMessage: "Thanks for your help!",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          unread: 0,
        },
        {
          id: "group2",
          type: "group",
          name: "Friends Chat",
          avatar: "/placeholder.svg?height=40&width=40",
          lastMessage: "Who's up for dinner tonight?",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
          unread: 3,
        },
      ]

      setChats(mockChats)
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

  if (chats.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>No recent chats</p>
        <Link href="/chat/new" className="mt-2 inline-block">
          <Button variant="outline" size="sm">
            Start a new chat
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-2">
        {chats.map((chat) => (
          <Link key={chat.id} href={chat.type === "private" ? `/chat/user/${chat.id}` : `/chat/group/${chat.id}`}>
            <Button variant="ghost" className="w-full justify-start p-3 h-auto">
              <div className="flex items-center gap-3 w-full">
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={chat.avatar || "/placeholder.svg"} alt={chat.name} />
                    <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {chat.unread > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                      {chat.unread}
                    </span>
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">{chat.name}</p>
                    <p className="text-xs text-slate-500">
                      {chat.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <p className="text-sm text-slate-500 truncate">{chat.lastMessage}</p>
                </div>
              </div>
            </Button>
          </Link>
        ))}
      </div>
    </ScrollArea>
  )
}
