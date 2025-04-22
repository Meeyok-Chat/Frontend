"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { fetchClient } from "@/lib/api/client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

type OnlineUser = {
  id: string
  username: string
  // avatar: string
  // status: "online" | "away" | "offline"
}

export function OnlineUsersList() {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true);
      try {
        const resp = await fetchClient.GET("/ws/clients");
        if (!resp.data) throw new Error(resp.error.message);

        setOnlineUsers(resp.data.users)
      } catch (err: any) {
        toast(`Error: ${err.message}`, { type: "error" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
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
          <Link key={user.id} href={`/chat/new?q=${user.username}`}>
            <Button variant="ghost" className="w-full justify-start p-2 h-auto">
              <div className="flex items-center gap-3">
                <span>{user.username}</span>
              </div>
            </Button>
          </Link>
        ))}
      </div>
    </ScrollArea>
  )
}
