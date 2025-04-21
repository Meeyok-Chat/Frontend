"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { set } from "date-fns"
import { fetchClient } from "@/lib/api/client"

interface FriendRequest {
  id?: string
  username?: string
}

export default function PendingFriendRequests() {
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchPendingRequests() {
      setIsFetching(true)
      try {
        const response = await fetchClient.GET("/friendships/{status}", {
          params: {
            path: {
              status: "pending"
            }
          }
        })
        if (!response.data) throw new Error(response.error.message);

        setPendingRequests(response.data)
      } catch (err: any) {
        console.error('Error while fetching friend requests', err);
        toast(`Error: ${err.message}`, { type: "error" });
      } finally {
        setIsFetching(false)
      }
    }

    fetchPendingRequests()
  }, [])

  const handleAcceptRequest = async (requestId: string) => {
    setIsLoading(true)

    try {
      const response = await fetchClient.PATCH('/friendships/accept/{userId}', {
        params: {
          path: {
            userId: requestId
          }
        }
      })
      if (!response.response.ok) throw new Error(response.error?.message);

      setPendingRequests((prev) => prev.filter((req) => req.id !== requestId))
      toast("Friend request accepted", { type: "success" })
    } catch (err: any) {
      console.error('Error while rejecting friend request', err);
      toast(`Error: ${err.message}`, { type: "error" });
    }

  }

  const handleRejectRequest = async (requestId: string) => {
    setIsLoading(true)

    try {
      const response = await fetchClient.PATCH('/friendships/reject/{userId}', {
        params: {
          path: {
            userId: requestId
          }
        }
      })
      if (!response.response.ok) throw Error(response.error?.message);

      setPendingRequests((prev) => prev.filter((req) => req.id !== requestId))
      toast("The friend request has been declined.", { type: "info" })
    } catch (err: any) {
      console.error('Error while rejecting friend request', err);
      toast(`Error: ${err.message}`, { type: "error" });
    }
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
          {isFetching ? (
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ) : pendingRequests.length === 0 ? (
            <p className="text-center text-gray-500">No pending friend requests</p>
          ) : (
            <ul className="space-y-4">
              {pendingRequests.map((request) => (
                <li key={request.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <p className="font-medium">{request.username}</p>
                    {/* <p className="text-sm text-gray-500">Requested on {request.requestDate}</p> */}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleAcceptRequest(request.id!)}
                      disabled={isLoading}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRejectRequest(request.id!)}
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