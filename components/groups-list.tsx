"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchClient } from "@/lib/api/client";
import { useSocket } from "@/lib/websocket/context";
import { EventType, NewGroupEvent } from "@/lib/websocket/type";
import { components } from "@/lib/api/schema";

type Group = {
  id: string;
  name: string;
  memberCount: number;
  lastActive: Date;
};

export function GroupsList() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { lastJsonMessage } = useSocket();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetchClient.GET("/chats");

        if (!response.data) {
          throw new Error(response.error.message);
        }

        const formattedGroups = response.data.filter(group => group.type?.toLowerCase() === "group").map((group: components["schemas"]["models.Chat"]) => ({
          id: group.id || "",
          name: group.name || "",
          memberCount: group.users?.length || 0,
          lastActive: new Date(group.updatedAt || Date.now()),
        }));
        formattedGroups.sort((a: any, b: any) => b.lastActive.getTime() - a.lastActive.getTime());
        setGroups(formattedGroups);
      } catch (error) {
        console.error("Failed to fetch groups:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGroups();
  }, []);

  async function appendGroup(groupId: string) {
    const newGroupData = await fetchClient.GET("/chats/{id}", {
      params: {
        path: { id: groupId },
      },
    });

    if (!newGroupData || !newGroupData.data) {
      console.log("Error while fetching new group data", newGroupData.error);
      return;
    }

    const newGroup: Group = {
      id: newGroupData.data.id || "",
      name: newGroupData.data.name || "",
      memberCount: newGroupData.data.users?.length || 0,
      lastActive: new Date(newGroupData.data.updatedAt || Date.now()),
    };

    const isAdded = groups.some((group) => group.id === newGroup.id);
    if (isAdded) return;
    setGroups(prev => [newGroup, ...prev]);
  }

  useEffect(() => {
    if (lastJsonMessage && lastJsonMessage.type === EventType.EVENT_NEW_GROUP) {
      const groupId = (lastJsonMessage.payload as NewGroupEvent).chat_id;
      appendGroup(groupId);
    }
  }, [lastJsonMessage]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>You're not in any groups yet</p>
        <Link href="/chat/new-group" className="mt-2 inline-block">
          <Button variant="outline" size="sm">
            Create a group
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-2">
        {groups.map((group) => (
          <Link key={group.id} href={`/chat/group/${group.id}`}>
            <Button variant="ghost" className="w-full justify-start p-3 h-auto">
              <div className="flex items-center gap-3 w-full">
                <Avatar>
                  <AvatarImage src={"/placeholder.svg"} alt={group.name} />
                  <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">{group.name}</p>
                    <p className="text-xs text-slate-500">
                      {group.lastActive.toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-sm text-slate-500">
                    {group.memberCount} members
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
