"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import { useEffect, useState } from "react"

type Group = {
  id: string
  name: string
  avatar: string
  memberCount: number
  lastActive: Date
}

export function GroupsList() {
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching groups
    setTimeout(() => {
      const mockGroups: Group[] = [
        {
          id: "group1",
          name: "Project Team",
          avatar: "/placeholder.svg?height=40&width=40",
          memberCount: 5,
          lastActive: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        },
        {
          id: "group2",
          name: "Friends Chat",
          avatar: "/placeholder.svg?height=40&width=40",
          memberCount: 8,
          lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        },
        {
          id: "group3",
          name: "Gaming Squad",
          avatar: "/placeholder.svg?height=40&width=40",
          memberCount: 4,
          lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        },
      ]

      setGroups(mockGroups)
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

  if (groups.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>You're not in any groups yet</p>
        <Link href="/chat/new-group" className="mt-2 inline-block">
          <Button variant="outline" size="sm">
            Create a group
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-2">
        {groups.map((group) => (
          <Link key={group.id} href={`/chat/group/${group.id}`}>
            <Button variant="ghost" className="w-full justify-start p-3 h-auto">
              <div className="flex items-center gap-3 w-full">
                <Avatar>
                  <AvatarImage src={group.avatar || "/placeholder.svg"} alt={group.name} />
                  <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">{group.name}</p>
                    <p className="text-xs text-slate-500">{group.lastActive.toLocaleDateString()}</p>
                  </div>
                  <p className="text-sm text-slate-500">{group.memberCount} members</p>
                </div>
              </div>
            </Button>
          </Link>
        ))}
      </div>
    </ScrollArea>
  )
}
