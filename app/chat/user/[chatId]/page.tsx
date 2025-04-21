"use client";

import type React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { components } from "@/lib/api/schema";
import { fetchClient } from "@/lib/api/client";
import { useSocket } from "@/lib/websocket/context";
import { toast } from "react-toastify";

export const runtime = "edge";

type Message = {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isRead: boolean;
};

export default function PrivateChat() {
  const params = useParams();
  const chatId = useMemo(() => params.chatId as string, [params]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // my user data
  const [myUser, setMyUser] = useState<
    components["schemas"]["models.User"] | null
  >(null);
  // another user chatting with me
  const [anotherUser, setAnotherUser] = useState<
    components["schemas"]["models.User"] | null
  >(null);
  // this chat data
  const [chatData, setChatData] = useState<
    components["schemas"]["models.Chat"] | null
  >(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  async function fetchChat() {
    const data = await fetchClient.GET(`/chats/{id}`, {
      params: {
        path: { id: chatId },
      },
    });
    if (!data || !data.data) {
      toast("Failed to fetch chat data.", { type: "error" });
      return null;
    }
    return data.data;
  }

  async function fetchUser() {
    const myUserData = await fetchClient.GET("/users/me");
    if (!myUserData || !myUserData.data) {
      console.log("Error fetching user data");
      return null;
    }
    const myUserId = myUserData.data.id as string;
    const anotherUserId = chatData?.users?.find((id) => id !== myUserId) || null;
    if (!anotherUserId) {
      console.log("Unauthorized Access, No your user found in chat data");
      return null;
    }
    const anotherUserData = await fetchClient.GET(`/users/{id}`, {
      params: {
        path: { id: anotherUserId },
      },
    });
    if (!anotherUserData || !anotherUserData.data) {
      console.log("Error fetching another user data");
      return null;
    }

    setMyUser(myUserData.data);
    setAnotherUser(anotherUserData.data);
  }

  // Fetching data
  useEffect(() => {
    fetchChat()
      .then((chat) => {
        setChatData(chat);
        if (chat) {
          const chatMessages = chat.messages || [];
          const formattedMessages = chatMessages.map((message) => ({
            id: message.id || "",
            senderId: message.from || "",
            text: message.message || "",
            timestamp: new Date(message.createAt || Date.now()),
            isRead: true, // Assume all messages are read for now
          }));
          setMessages(formattedMessages);
        }
      })
      .then(() =>
        fetchUser()
      );
  }, [chatId]);

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
      senderId: "me",
      text: newMessage,
      timestamp: new Date(),
      isRead: false,
    };

    setMessages([...messages, message]);
    sendJsonMessage({
      type: EventType.EVENT_SEND_MESSAGE,
      payload: {
        chat_id: chatId,
        message: newMessage,
        from: myUser?.id || "", // should not be empty string
        createAt: new Date().toISOString(),
      }
    });
    setNewMessage("");
  };

  useEffect(() => {
    if (!lastJsonMessage) return;

    if (lastJsonMessage.type === EventType.EVENT_NEW_MESSAGE) {
      if (lastJsonMessage.payload.chat_id !== chatId) return;

      const newMessage: Message = {
        id: messages.length.toString(),
        senderId: lastJsonMessage.payload.from,
        text: lastJsonMessage.payload.message,
        timestamp: new Date(lastJsonMessage.payload.createAt),
        isRead: false,
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    }
  }, [lastJsonMessage]);

  if (!anotherUser || !chatData || !myUser) {
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
              src={"/placeholder.svg"} // Replace with actual user avatar URL
              alt={anotherUser.username}
            />
            <AvatarFallback>{anotherUser.username?.charAt(0)}</AvatarFallback>
          </Avatar>
          <CardTitle>{anotherUser.username}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderId !== anotherUser.id
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.senderId !== anotherUser.id
                    ? "bg-slate-800 text-white"
                    : "bg-slate-200 text-slate-900"
                }`}
              >
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
