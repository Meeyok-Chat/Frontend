"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { fetchClient } from "@/lib/api/client";

type User = {
  id: string;
  name: string;
  avatar?: string;
};

export default function NewChat() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const router = useRouter();
  const { toast } = useToast();

  // get current user id
  const getCurrentUserId = async () => {
    try {
      const res = await fetchClient.GET("/users/me");
      return res.data?.id;
    } catch (error) {
      console.error("Failed to fetch current user ID", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchCurrentUserId = async () => {
      const userId = await getCurrentUserId();
      setCurrentUserId(userId || "");
      if (!userId) {
        toast({
          title: "Error",
          description: "Failed to fetch current user ID",
          variant: "destructive",
        });
      }
    };

    fetchCurrentUserId();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetchClient.GET("/users");
        // console.log("Fetched users:", res.data);
        setUsers(
          (res.data || []).map((user: any) => ({
            id: user.id,
            name: user.username || "Unknown",
            avatar: user.avatar,
          }))
        );
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        });
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // TODO: This doesn't work ???
  const handleStartChat = async (userId: string, username: string) => {
    try {
      // console.log("Starting chat with user ID:", userId);
      const chatPayload = {
        name: username,
        type: "friend",
        updatedAt: new Date().toISOString(),
        users: [userId, currentUserId],
        messages: [],
      };

      const res = await fetchClient.POST("/chats", {
        body: chatPayload,
      });
      console.log("Chat created:", res.data);
      toast({
        title: "Chat started",
        description: "You can now start messaging",
      });
      // TODO: response should contain chat ID
      if (res.data?.id) {
        router.push(`/chat/${res.data.id}`);
      } else {
        // console.error("Failed to retrieve chat ID from response:", res.data);
        toast({
          title: "Error",
          description: "Failed to retrieve chat ID",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create chat",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 pb-4 border-b">
          <Link href="/chat">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <CardTitle>Start a New Chat</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search users..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-500">Online Users</h3>
            {filteredUsers.length > 0 ? (
              <ul className="space-y-2">
                {filteredUsers.map((user) => (
                  <li key={user.id}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-2 h-auto"
                      onClick={() => handleStartChat(user.id, user.name)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage
                              src={user.avatar || "/placeholder.svg"}
                              alt={user.name}
                            />
                            <AvatarFallback>
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-1 ring-white" />
                        </div>
                        <span>{user.name}</span>
                      </div>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-slate-500 py-4">No users found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
