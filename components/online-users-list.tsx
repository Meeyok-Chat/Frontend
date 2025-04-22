"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchClient } from "@/lib/api/client";
import { useSocket } from "@/lib/websocket/context";
import { EventType, NewUserStatusEvent } from "@/lib/websocket/type";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type OnlineUser = {
  id: string;
  username: string;
  // avatar: string
  // status: "online" | "away" | "offline"
};

export function OnlineUsersList() {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { lastJsonMessage } = useSocket();

  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true);
      try {
        const resp = await fetchClient.GET("/ws/clients");
        if (!resp.data) throw new Error(resp.error.message);

        setOnlineUsers(resp.data.users);
      } catch (err: any) {
        toast(`Error: ${err.message}`, { type: "error" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
  }, []);

  async function appendUser(userId: string) {
    console.log("Fetching user data for", userId);
    const newUserData = await fetchClient.GET("/users/{id}", {
      params: {
        path: { id: userId },
      },
    });
    if (!newUserData || !newUserData.data) {
      console.log("Error while fetching new user data", newUserData.error);
      return;
    }

    const newUser: OnlineUser = {
      id: newUserData.data.id || "",
      username: newUserData.data.username || "",
    };

    const isAdded = onlineUsers.some((user) => user.id === newUser.id);
    console.log(onlineUsers, isAdded)
    if (isAdded) return;
    setOnlineUsers(prev => [...prev, newUser]);
  }

  useEffect(() => {
    if (lastJsonMessage && lastJsonMessage.type === EventType.EVENT_NEW_USER) {
      const userId = (lastJsonMessage.payload as NewUserStatusEvent).user_id;
      appendUser(userId);
    }

    if (
      lastJsonMessage &&
      lastJsonMessage.type === EventType.EVENT_LEAVE_USER
    ) {
      const userId = (lastJsonMessage.payload as NewUserStatusEvent).user_id;
      setOnlineUsers((prev) => prev.filter((user) => user.id !== userId));
    }
  }, [lastJsonMessage]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
      </div>
    );
  }

  if (onlineUsers.length === 0) {
    return (
      <div className="text-center py-4 text-slate-500">No users online</div>
    );
  }

  return (
    <ScrollArea className="h-[200px]">
      <div className="space-y-2">
        {onlineUsers.map((user) => (
          <Link key={user.id} href={`/chat/new?q=${user.username}`}>
            <Button variant="ghost" className="w-full justify-start p-2 h-auto">
              <div className="flex items-center gap-3">
                <span>{user.username}</span>
              </div>
            </Button>
          </Link>
        ))}
      </div>
    </ScrollArea>
  );
}
