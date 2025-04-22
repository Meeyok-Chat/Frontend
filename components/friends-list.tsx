"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { fetchClient } from "@/lib/api/client"
import Link from "next/link"
import { useEffect, useState } from "react"

type Friend = {
  id: string
  username: string
  status: "online" | "offline"
}

export function FriendsList() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await fetchClient.GET("/friendships/{status}", {
          params: {
            path: {
              status: "accepted"
            }
          }
        });
        // backend can send null if response is empty
        if(response.data === null) response.data = [];

        if (!response.data) throw Error("An error occurred while loading friends: " + response.error.message);
        
        setFriends(response.data.map(u => ({
          id: u.id!,
          username: u.username!,

          // TODO: set status from online users
          status: "online"
        })));
      } catch (err: any) {
        console.error('Error while fetching friends', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFriends()
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
                {/* <div className="relative">
                  <Avatar>
                    <AvatarImage src={friend.avatar || "/placeholder.svg"} alt={friend.name} />
                    <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span
                    className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-1 ring-white ${friend.status === "online"
                        ? "bg-green-500"
                        : "bg-slate-300"
                      }`}
                  />
                </div> */}
                <div className="flex-1 flex flex-row items-center gap-4 overflow-hidden">
                  <p className="truncate">{friend.username}</p>
                  <p className="text-xs text-slate-500">
                    {friend.status === "online" ? "(Online)" : "(Offline)"}
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
