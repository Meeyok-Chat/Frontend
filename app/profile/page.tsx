"use client"

import type React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
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
          console.log('user data', response.data)
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

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })
    }, 1500)
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
          <form onSubmit={handleUpdateProfile}>
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
                <Input id="status" value={status} onChange={(e) => setStatus(e.target.value)} />
              </div>

              <Separator />

              {/* <div className="space-y-2">
                <Label htmlFor="note">Status Note</Label>
                <Textarea id="note" placeholder="Share what's on your mind..." className="resize-none" rows={3} />
                <p className="text-xs text-slate-500">This note will be visible to your friends</p>
              </div> */}
            </CardContent>
            <CardFooter className="border-t p-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Profile"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
