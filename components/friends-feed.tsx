"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { fetchClient } from "@/lib/api/client"
import { paths } from "@/lib/api/schema"
import { Heart, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { useUser } from "./user-provider"

type Note = {
  id: string
  userId: string
  username: string
  content: string
  createdAt: string
}

// type PostResponse = paths["/posts"]["get"]["responses"]["200"]["content"]["application/json"]

export function FriendsFeed() {
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newNote, setNewNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchPosts = async () => {
    setIsLoading(true)

    try {
      const postResp = await fetchClient.GET("/posts/")
      if (!postResp.data) throw new Error(postResp.error.message)

      const usersResp = await fetchClient.GET("/users")
      if (!usersResp.data) throw new Error(usersResp.error.message)

      const posts = postResp.data;
      const users = usersResp.data;

      const notes: Note[] = posts.map((post) => ({
        content: post.content!,
        createdAt: post.createdAt!,
        id: post.id!,
        userId: post.userId!,
        username: users.find((user) => user.id === post.userId)?.username!,
      }))

      notes.reverse()

      setNotes(notes)
    } catch (err: any) {
      console.error(err);
      toast(`Error: ${err.message}`, { type: "error" });
    } finally {
      setIsLoading(false)
    }
  }
  useEffect(() => {
    fetchPosts()
  }, [])

  const handlePostNote = async () => {
    if (!newNote.trim()) return

    setIsSubmitting(true)

    try {
      const user = await fetchClient.GET("/users/me")
      if (!user.data) throw new Error(user.error.message)


      const response = await fetchClient.POST("/posts", {
        body: {
          content: newNote,
          createdAt: new Date().toISOString(),
          title: "New Post",
          userId: user.data.id
        }
      })
      if (!response.response.ok) throw new Error(response.error?.message)

      fetchPosts()
      toast("Your post has been submitted", { type: "info" })
    } catch (err: any) {
      toast(`Error: ${err.message}`, { type: "error" });
    } finally {
      setIsSubmitting(false)
    }
  }


  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <Textarea
            placeholder="Share what's on your mind..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="resize-none"
          />
        </CardHeader>
        <CardFooter>
          <Button onClick={handlePostNote} disabled={!newNote.trim() || isSubmitting} className="ml-auto">
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </CardFooter>
      </Card>

      {notes.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <p>No notes from friends yet</p>
        </div>
      ) : (
        <ScrollArea className="h-[500px]">
          <div className="space-y-4">
            {notes.map((note) => (
              <Card key={note.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    {/* <Link href={`/chat/${note.userId}`}>
                      <Avatar>
                        <AvatarImage src={note.userAvatar || "/placeholder.svg"} alt={note.userName} />
                        <AvatarFallback>{note.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </Link> */}
                    <div>
                      <Link href={`/chat/${note.userId}`} className="font-medium hover:underline">
                        {note.username}
                      </Link>
                      <p className="text-xs text-slate-500">{formatTimestamp(new Date(note.createdAt!))}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{note.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}

function formatTimestamp(date: Date): string {
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
