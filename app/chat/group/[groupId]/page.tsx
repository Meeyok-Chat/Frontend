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
import { useSocket } from "@/lib/websocket/context";
import { components } from "@/lib/api/schema";
import { EventType } from "@/lib/websocket/type";

export const runtime = "edge";

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
  const [group, setGroup] = useState<
    components["schemas"]["models.Chat"] | null
  >(null);
  const [showMembers, setShowMembers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [myUser, setMyUser] = useState<
    components["schemas"]["models.User"] | null
  >(null);
  const [memberDatas, setMemberDatas] = useState<
    components["schemas"]["models.User"][]
  >([]);

  async function fetchAllUsers() {
    const data = await fetchClient.GET("/users/me");
    if (!data || !data.data) {
      console.log("Error fetching user data");
      return;
    }
    setMyUser(data.data);

    if (!group || !group.users ) return;
    try {
      const allMemberResponses = await Promise.all(
        group.users.map((memberId) =>
          fetchClient.GET("/users/{id}", {
            params: { path: { id: memberId } },
          })
        )
      );

      const validMembers = allMemberResponses
        .map((res) => res?.data)
        .filter((user): user is NonNullable<typeof user> => !!user);
      setMemberDatas(validMembers);
    } catch (error) {
      console.error("Error fetching member data:", error);
    }
  }

  async function fetchMessages() {
    // Fetch chat history
    const chatRes = await fetchClient.GET("/chats/{id}", {
      params: {
        path: { id: groupId },
      },
    });
    
    const fetchedMessages: Message[] =
      chatRes.data?.messages?.map(
        (msg: components["schemas"]["models.Message"]) => {
          {
            const sender = memberDatas.find((m) => m.id === msg.from);
            return {
              id: msg.id || "",
              senderId: msg.from || "",
              senderName: sender?.username || "Unknown",
              text: msg.message || "",
              timestamp: new Date(msg.createAt || Date.now()),
            };
          }
        }
      ) || [];

    setMessages(fetchedMessages);
  }

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
        const currentGroup = groups.find((g) => g.id === groupId);

        if (!currentGroup) {
          console.warn("Group not found");
          setGroup({
            id: groupId,
            name: "Unknown Group",
            messages: [],
            type: "Group",
            users: [],
          });
          return;
        }

        setGroup(currentGroup);
      } catch (error) {
        console.error("Error fetching group or chat history:", error);
      }
    };

    if (groupId) {
      fetchGroupData()
    }
  }, [groupId]);

  useEffect(() => {
    if (!group) return;
    fetchAllUsers();
  }, [group]);

  useEffect(() => {
    if (!memberDatas) return;
    fetchMessages();
  }, [memberDatas]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const { sendJsonMessage, lastJsonMessage } = useSocket();
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: myUser?.id || "",
      senderName: myUser?.username || "Unknown",
      text: newMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, message]);
    sendJsonMessage({
      type: EventType.EVENT_SEND_MESSAGE,
      payload: {
        chat_id: groupId,
        message: newMessage,
        from: myUser?.id || "", // should not be empty string
        createAt: new Date().toISOString(),
      },
    });
    setNewMessage("");
  };

  useEffect(() => {
    if (!lastJsonMessage) return;

    if (lastJsonMessage.type === EventType.EVENT_NEW_MESSAGE) {
      if (lastJsonMessage.payload.chat_id !== groupId) return;

      const newMessage: Message = {
        id: messages.length.toString(),
        senderId: lastJsonMessage.payload.from,
        senderName:
          memberDatas.find(
            (member) => member.id === lastJsonMessage.payload.from
          )?.username || "Unknown",
        text: lastJsonMessage.payload.message,
        timestamp: new Date(lastJsonMessage.payload.createAt),
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    }
  }, [lastJsonMessage]);

  if (!group || !memberDatas) {
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
            <AvatarImage src={"/placeholder.svg"} alt={group?.name} />
            <AvatarFallback>{group?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <CardTitle className="flex-1">{group?.name}</CardTitle>
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
                  message.senderId === myUser?.id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.senderId === myUser?.id
                      ? "bg-slate-800 text-white"
                      : "bg-slate-200 text-slate-900"
                  }`}
                >
                  {message.senderId !== myUser?.id && (
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
                    Group Members ({memberDatas.length})
                  </DrawerTitle>
                  <DrawerDescription>
                    People in this conversation
                  </DrawerDescription>
                </DrawerHeader>
                <div className="px-4 py-2">
                  <ul className="space-y-4">
                    {memberDatas.map((member: any) => (
                      <li key={member.id} className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src="/placeholder.svg?height=40&width=40"
                            alt={member.name}
                          />
                          <AvatarFallback>{member.name}</AvatarFallback>
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
