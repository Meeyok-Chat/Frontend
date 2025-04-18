"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Search } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

// Mock online users data
const mockOnlineUsers = [
  { id: "user1", name: "Alex Johnson", avatar: "/placeholder.svg?height=40&width=40", status: "online" },
  { id: "user2", name: "Sam Wilson", avatar: "/placeholder.svg?height=40&width=40", status: "online" },
  { id: "user3", name: "Taylor Smith", avatar: "/placeholder.svg?height=40&width=40", status: "online" },
  { id: "user4", name: "Jordan Lee", avatar: "/placeholder.svg?height=40&width=40", status: "online" },
  { id: "user5", name: "Casey Brown", avatar: "/placeholder.svg?height=40&width=40", status: "online" },
]

export default function NewChat() {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const filteredUsers = mockOnlineUsers.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleStartChat = (userId: string) => {
    toast({
      title: "Chat started",
      description: "You can now start messaging",
    })
    router.push(`/chat/${userId}`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 pb-4 border-b">
          <Link href="/chat">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <CardTitle>Start a New Chat</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search users..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-500">Online Users</h3>
            {filteredUsers.length > 0 ? (
              <ul className="space-y-2">
                {filteredUsers.map((user) => (
                  <li key={user.id}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-2 h-auto"
                      onClick={() => handleStartChat(user.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-1 ring-white" />
                        </div>
                        <span>{user.name}</span>
                      </div>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-slate-500 py-4">No users found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
