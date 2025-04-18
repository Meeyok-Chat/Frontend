"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function AddFriend() {
  const [friendId, setFriendId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault()

    if (!friendId.trim()) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Friend request sent",
        description: "Your friend request has been sent successfully",
      })
      router.push("/chat")
    }, 1500)
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 pb-4 border-b">
          <Link href="/chat">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <CardTitle>Add a Friend</CardTitle>
            <CardDescription>Send a friend request to another user</CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleAddFriend}>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="friendId">Friend's ID or Display Name</Label>
              <Input
                id="friendId"
                placeholder="Enter friend's ID or display name"
                value={friendId}
                onChange={(e) => setFriendId(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="border-t p-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending Request..." : "Send Friend Request"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
