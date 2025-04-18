"use client"

import type React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Send } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"

export const runtime = 'edge';

// Mock data for private chat
const mockUsers = {
  user1: { id: "user1", name: "Alex Johnson", avatar: "/placeholder.svg?height=40&width=40" },
  user2: { id: "user2", name: "Sam Wilson", avatar: "/placeholder.svg?height=40&width=40" },
  user3: { id: "user3", name: "Taylor Smith", avatar: "/placeholder.svg?height=40&width=40" },
}

type Message = {
  id: string
  senderId: string
  text: string
  timestamp: Date
  isRead: boolean
}

export default function PrivateChat() {
  const params = useParams()
  const userId = params.userId as string
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [user, setUser] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Simulate fetching user data
  useEffect(() => {
    setUser(
      mockUsers[userId as keyof typeof mockUsers] || {
        id: userId,
        name: "Unknown User",
        avatar: "/placeholder.svg?height=40&width=40",
      },
    )

    // Simulate fetching chat history
    const mockMessages = [
      {
        id: "1",
        senderId: userId,
        text: "Hey there! How are you?",
        timestamp: new Date(Date.now() - 3600000),
        isRead: true,
      },
      {
        id: "2",
        senderId: "me",
        text: "I'm good, thanks for asking! How about you?",
        timestamp: new Date(Date.now() - 3500000),
        isRead: true,
      },
      {
        id: "3",
        senderId: userId,
        text: "Doing well! Just wanted to catch up.",
        timestamp: new Date(Date.now() - 3400000),
        isRead: true,
      },
    ]

    setMessages(mockMessages)
  }, [userId])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      senderId: "me",
      text: newMessage,
      timestamp: new Date(),
      isRead: false,
    }

    setMessages([...messages, message])
    setNewMessage("")

    // Simulate receiving a response
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        senderId: userId,
        text: "Thanks for your message! I'll get back to you soon.",
        timestamp: new Date(),
        isRead: false,
      }

      setMessages((prev) => [...prev, response])
    }, 2000)
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <Card className="flex flex-col h-full">
        <CardHeader className="flex flex-row items-center gap-4 pb-4 border-b">
          <Link href="/chat" className="mr-2">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Avatar>
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <CardTitle>{user.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.senderId === "me" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.senderId === "me" ? "bg-slate-800 text-white" : "bg-slate-200 text-slate-900"
                }`}
              >
                <p>{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </CardContent>
        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
