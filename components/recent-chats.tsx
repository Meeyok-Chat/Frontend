"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchClient } from "@/lib/api/client";
import { components } from "@/lib/api/schema";
import Link from "next/link";
import { useEffect, useState } from "react";

type ChatPreview = {
  id: string;
  type: "Individual" | "Group";
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: Date;
  unread: number;
};

export function RecentChats() {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchRecentChats() {
    const data = await fetchClient.GET("/chats");
    const user = await fetchClient.GET("/users/me");

    if (!data || !data.data || !user || !user.data) {
      console.error("Error fetching recent chats or user data");
      return [];
    }
    const userId = user.data.id as string;
    const recentChats: ChatPreview[] = data.data
      .filter((chat: components["schemas"]["models.Chat"]) => {
        return chat.users?.includes(userId);
      })
      .map((chat: components["schemas"]["models.Chat"]) => {
        const lastMessage = chat.messages?.[0] || null;
        const mapValue: ChatPreview = {
          id: chat.id || "", // should not be empty string
          type: chat.type as "Individual" | "Group",
          name: chat.name || "Chat",
          avatar: "/placeholder.svg",
          lastMessage: lastMessage?.message || "",
          timestamp: new Date(chat.updatedAt || Date.now()),
          unread: 0, // Assume 0 unread (not implement)
        };
        return mapValue;
      });
    return recentChats;
  }

  useEffect(() => {
    setIsLoading(true);
    fetchRecentChats()
      .then((data) => {
        setChats(data);
      })
      .catch((error) => {
        console.error("Error fetching recent chats:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>No recent chats</p>
        <Link href="/chat/new" className="mt-2 inline-block">
          <Button variant="outline" size="sm">
            Start a new chat
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-2">
        {chats.map((chat) => (
          <Link
            key={chat.id}
            href={
              chat.type === "Individual"
                ? `/chat/user/${chat.id}`
                : `/chat/group/${chat.id}`
            }
          >
            <Button variant="ghost" className="w-full justify-start p-3 h-auto">
              <div className="flex items-center gap-3 w-full">
                <div className="relative">
                  <Avatar>
                    <AvatarImage
                      src={chat.avatar || "/placeholder.svg"}
                      alt={chat.name}
                    />
                    <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {chat.unread > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                      {chat.unread}
                    </span>
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">{chat.name}</p>
                    <p className="text-xs text-slate-500">
                      {chat.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <p className="text-sm text-slate-500 truncate">
                    {chat.lastMessage}
                  </p>
                </div>
              </div>
            </Button>
          </Link>
        ))}
      </div>
    </ScrollArea>
  );
}
