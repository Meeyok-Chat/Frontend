"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { fetchClient } from "@/lib/api/client"

export default function Profile() {
  const [displayName, setDisplayName] = useState("Loading...")
  const [id, setId] = useState("Loading...")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetchClient.GET("/users/me");
        if (response.data) {
          setDisplayName(response.data.username ?? '');
          setId(response.data.id ?? '');
        } else {
          throw Error("An error occurred while loading user profile: " + response.error.message);
        }
      } catch (err: any) {
        alert(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserProfile();
  }, [])

  const handleUpdateProfile = async () => {
    setIsLoading(true)
    try {
      const result = await fetchClient.PATCH("/users/{id}/username", {
        params: {
          path: { id }
        },
        body: {
          username: displayName,
        }
      })
      if (!result.response.ok) throw Error("An error occured while trying to set username: " + result.error);
    } catch (err: any) {
      alert(err.message);
      console.error('Error while editing profile', err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4 pb-4 border-b">
            <Link href="/chat">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </div>
          </CardHeader>
          <div >
            <CardContent className="p-4 space-y-6">
              {/* <div className="flex flex-col items-center justify-center space-y-2">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Profile" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">
                  Change Avatar
                </Button>
              </div> */}

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">User ID</Label>
                <div className="flex flex-row items-center gap-4">
                  <div className="flex text-base" >{id}</div>
                  <Button variant="outline" size="sm" onClick={() => {
                    navigator.clipboard.writeText(id);
                    alert("User ID copied to clipboard")
                    // toast({
                    //   title: "Copied",
                    //   description: "User ID copied to clipboard",
                    // })
                  }}>
                    Copy User ID
                  </Button>
                </div>
              </div>

              {/* <Separator /> */}

              {/* <div className="space-y-2">
                <Label htmlFor="note">Status Note</Label>
                <Textarea id="note" placeholder="Share what's on your mind..." className="resize-none" rows={3} />
                <p className="text-xs text-slate-500">This note will be visible to your friends</p>
              </div> */}
            </CardContent>
            <CardFooter className="border-t p-4">
              <Button type="submit" className="w-full" onClick={handleUpdateProfile} disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Profile"}
              </Button>
            </CardFooter>
          </div>
        </Card>
      </div>
    </div>
  )
}
