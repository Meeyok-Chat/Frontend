"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchClient } from "@/lib/api/client";

type Group = {
  id: string;
  name: string;
  memberCount: number;
  lastActive: Date;
};

export function GroupsList() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetchClient.GET("/chats/user/{type}", {
          params: {
            path: { type: "group" },
          },
        });
        console.log('data', response.data)
        if (response.data) {
          console.log(response.data);
          const formattedGroups = response.data.map((group: any) => ({
            id: group.id,
            name: group.name,
            memberCount: group.memberCount,
            lastActive: new Date(group.updatedAt),
          }));
          setGroups(formattedGroups);
        }
      } catch (error) {
        console.error("Failed to fetch groups:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGroups();
  }, []);

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
