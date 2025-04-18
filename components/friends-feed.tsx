"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Heart, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

type Note = {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  timestamp: Date
  likes: number
  hasLiked: boolean
  comments: number
}

export function FriendsFeed() {
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newNote, setNewNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Simulate fetching notes
    setTimeout(() => {
      const mockNotes: Note[] = [
        {
          id: "note1",
          userId: "user1",
          userName: "Alex Johnson",
          userAvatar: "/placeholder.svg?height=40&width=40",
          content: "Just finished a great book! Would highly recommend 'The Midnight Library' to everyone.",
          timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
          likes: 5,
          hasLiked: false,
          comments: 2,
        },
        {
          id: "note2",
          userId: "user2",
          userName: "Sam Wilson",
          userAvatar: "/placeholder.svg?height=40&width=40",
          content: "Working on a new project. Can't wait to share it with you all!",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
          likes: 8,
          hasLiked: true,
          comments: 4,
        },
        {
          id: "note3",
          userId: "user3",
          userName: "Taylor Smith",
          userAvatar: "/placeholder.svg?height=40&width=40",
          content: "Beautiful day for a hike! 🏞️",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
          likes: 12,
          hasLiked: false,
          comments: 3,
        },
      ]

      setNotes(mockNotes)
      setIsLoading(false)
    }, 1000)
  }, [])

  const handlePostNote = () => {
    if (!newNote.trim()) return

    setIsSubmitting(true)

    // Simulate posting a note
    setTimeout(() => {
      const newNoteObj: Note = {
        id: `note${Date.now()}`,
        userId: "me",
        userName: "You",
        userAvatar: "/placeholder.svg?height=40&width=40",
        content: newNote,
        timestamp: new Date(),
        likes: 0,
        hasLiked: false,
        comments: 0,
      }

      setNotes([newNoteObj, ...notes])
      setNewNote("")
      setIsSubmitting(false)

      toast({
        title: "Note posted",
        description: "Your note has been posted to your friends feed",
      })
    }, 1000)
  }

  const handleLike = (noteId: string) => {
    setNotes((prev) =>
      prev.map((note) => {
        if (note.id === noteId) {
          return {
            ...note,
            likes: note.hasLiked ? note.likes - 1 : note.likes + 1,
            hasLiked: !note.hasLiked,
          }
        }
        return note
      }),
    )
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
                    <Link href={`/chat/${note.userId}`}>
                      <Avatar>
                        <AvatarImage src={note.userAvatar || "/placeholder.svg"} alt={note.userName} />
                        <AvatarFallback>{note.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </Link>
                    <div>
                      <Link href={`/chat/${note.userId}`} className="font-medium hover:underline">
                        {note.userName}
                      </Link>
                      <p className="text-xs text-slate-500">{formatTimestamp(note.timestamp)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{note.content}</p>
                </CardContent>
                <CardFooter className="border-t pt-3">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => handleLike(note.id)}
                    >
                      <Heart className={`h-4 w-4 ${note.hasLiked ? "fill-red-500 text-red-500" : ""}`} />
                      <span>{note.likes}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{note.comments}</span>
                    </Button>
                  </div>
                </CardFooter>
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
