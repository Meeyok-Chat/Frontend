"use client";

import type React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlusCircle, ArrowLeft, Send, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { fetchClient } from "@/lib/api/client";

export const runtime = "edge";

// Mock data for group chat
// const mockGroups = {
//   group1: {
//     id: "group1",
//     name: "Project Team",
//     avatar: "/placeholder.svg?height=40&width=40",
//     members: [
//       { id: "user1", name: "Alex Johnson" },
//       { id: "user2", name: "Sam Wilson" },
//       { id: "user3", name: "Taylor Smith" },
//       { id: "me", name: "You" },
//     ],
//   },
//   group2: {
//     id: "group2",
//     name: "Friends Chat",
//     avatar: "/placeholder.svg?height=40&width=40",
//     members: [
//       { id: "user2", name: "Sam Wilson" },
//       { id: "user3", name: "Taylor Smith" },
//       { id: "me", name: "You" },
//     ],
//   },
// };

type Message = {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
};

export default function GroupChat() {
  const params = useParams();
  const groupId = params.groupId as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [group, setGroup] = useState<any>(null);
  const [showMembers, setShowMembers] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetching group data
  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        // Fetch group info
        const groupsRes = await fetchClient.GET("/chats/user/{type}", {
          params: {
            path: { type: "group" },
          },
        });

        const groups = groupsRes.data || [];
        const currentGroup = groups.find((g: any) => g.id === groupId);

        if (!currentGroup) {
          console.warn("Group not found");
          setGroup({
            id: groupId,
            name: "Unknown Group",
            avatar: "/placeholder.svg?height=40&width=40",
            members: [{ id: "me", name: "You" }],
          });
          return;
        }

        setGroup(currentGroup);

        // Fetch chat history
        const chatRes = await fetchClient.GET("/chats/{id}", {
          params: {
            path: { id: groupId },
          },
        });

        const fetchedMessages = Array.isArray(chatRes.data)
          ? chatRes.data.map((msg: any) => ({
              id: msg.id,
              senderId: msg.senderId,
              senderName: msg.senderName,
              text: msg.text,
              timestamp: new Date(msg.timestamp),
            }))
          : [];

        setMessages(fetchedMessages);
      } catch (error) {
        console.error("Error fetching group or chat history:", error);
      }
    };

    if (groupId) {
      fetchGroupData();
    }
  }, [groupId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: "me",
      senderName: "You",
      text: newMessage,
      timestamp: new Date(),
    };

    setMessages([...messages, message]);
    setNewMessage("");

    // TODO: Simulate receiving a response
    setTimeout(() => {
      const randomMember = group.members.find((m: any) => m.id !== "me");
      if (randomMember) {
        const response: Message = {
          id: (Date.now() + 1).toString(),
          senderId: randomMember.id,
          senderName: randomMember.name,
          text: "Thanks for your message!",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, response]);
      }
    }, 2000);
  };

  if (!group) {
    return <div>Loading...</div>;
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
            <AvatarImage
              src={group.avatar || "/placeholder.svg"}
              alt={group.name}
            />
            <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <CardTitle className="flex-1">{group.name}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMembers(!showMembers)}
            aria-label="Show members"
          >
            <Users className="h-4 w-4" />
          </Button>
        </CardHeader>

        <div className="flex flex-1 overflow-hidden">
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.senderId === "me" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.senderId === "me"
                      ? "bg-slate-800 text-white"
                      : "bg-slate-200 text-slate-900"
                  }`}
                >
                  {message.senderId !== "me" && (
                    <p className="text-xs font-medium mb-1">
                      {message.senderName}
                    </p>
                  )}
                  <p>{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </CardContent>

          {showMembers && (
            <Drawer open={showMembers} onOpenChange={setShowMembers}>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>
                    Group Members ({group.members.length})
                  </DrawerTitle>
                  <DrawerDescription>
                    People in this conversation
                  </DrawerDescription>
                </DrawerHeader>
                <div className="px-4 py-2">
                  <ul className="space-y-4">
                    {group.members.map((member: any) => (
                      <li key={member.id} className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src="/placeholder.svg?height=40&width=40"
                            alt={member.name}
                          />
                          <AvatarFallback>
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-slate-500">
                            {member.id === "me" ? "You" : "Online"}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <DrawerFooter>
                  <Button
                    onClick={() => {
                      setShowMembers(false);
                      setShowAddMembers(true);
                    }}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Members
                  </Button>
                  <DrawerClose asChild>
                    <Button variant="outline">Close</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          )}

          {showAddMembers && (
            <Drawer open={showAddMembers} onOpenChange={setShowAddMembers}>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Add Members</DrawerTitle>
                  <DrawerDescription>
                    Add new people to this group
                  </DrawerDescription>
                </DrawerHeader>
                <div className="px-4 py-2">
                  <Input placeholder="Search users..." className="mb-4" />
                  <ul className="space-y-4">
                    {[
                      {
                        id: "user4",
                        name: "Jordan Lee",
                        avatar: "/placeholder.svg?height=40&width=40",
                      },
                      {
                        id: "user5",
                        name: "Casey Brown",
                        avatar: "/placeholder.svg?height=40&width=40",
                      },
                      {
                        id: "user6",
                        name: "Riley Green",
                        avatar: "/placeholder.svg?height=40&width=40",
                      },
                    ].map((user) => (
                      <li
                        key={user.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage
                              src={user.avatar || "/placeholder.svg"}
                              alt={user.name}
                            />
                            <AvatarFallback>
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{user.name}</span>
                        </div>
                        <Button size="sm" variant="outline">
                          Add
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
                <DrawerFooter>
                  <DrawerClose asChild>
                    <Button variant="outline">Close</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          )}
        </div>

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
  );
}
