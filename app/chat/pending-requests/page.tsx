"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "react-toastify"

interface FriendRequest {
  id: string
  displayName: string
  requestDate: string
}

export default function PendingFriendRequests() {
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([
    { id: "1", displayName: "JohnDoe", requestDate: "2025-04-20" },
    { id: "2", displayName: "JaneSmith", requestDate: "2025-04-19" },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleAcceptRequest = (requestId: string) => {
    setIsLoading(true)

    // Simulate API call to accept friend request
    setTimeout(() => {
      setPendingRequests((prev) => prev.filter((req) => req.id !== requestId))
      setIsLoading(false)
      toast("Friend request accepted", { type: "success" })
    }, 1000)
  }

  const handleRejectRequest = (requestId: string) => {
    setIsLoading(true)

    // Simulate API call to reject friend request
    setTimeout(() => {
      setPendingRequests((prev) => prev.filter((req) => req.id !== requestId))
      setIsLoading(false)
      toast("The friend request has been declined.", { type: "info" })
    }, 1000)
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
            <CardTitle>Pending Friend Requests</CardTitle>
            <CardDescription>Manage your incoming friend requests</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {pendingRequests.length === 0 ? (
            <p className="text-center text-gray-500">No pending friend requests</p>
          ) : (
            <ul className="space-y-4">
              {pendingRequests.map((request) => (
                <li key={request.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <p className="font-medium">{request.displayName}</p>
                    <p className="text-sm text-gray-500">Requested on {request.requestDate}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleAcceptRequest(request.id)}
                      disabled={isLoading}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRejectRequest(request.id)}
                      disabled={isLoading}
                    >
                      Reject
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}