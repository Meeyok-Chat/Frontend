"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Search } from "lucide-react";
import { fetchClient } from "@/lib/api/client";
import { toast } from "react-toastify";

type User = {
  id: string;
  name: string;
};

export default function NewGroup() {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
        toast("Failed to fetch current user ID", { type: "error" });
      }
    };

    fetchCurrentUserId();
  }, []);


  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      toast("Please enter a name for your group", { type: "error" });
      return;
    }

    setIsLoading(true);

    // Create group API call
    const createGroup = async () => {
      try {
        const chatPayload = {
          name: groupName,
          type: "Group",
          users: [currentUserId],
        };

        const res = await fetchClient.POST("/chats", {
          body: chatPayload,
        });
        if(!res.data) throw new Error(res.error.message)

        router.push(`/chat/group/${res.data.id}`);
        toast(`Created group "${groupName}"`, { type: "success" });
      } catch (error) {
        toast("Failed to create group", { type: "error" });
      } finally {
        setIsLoading(false);
      }
    };
    createGroup();
  };

  return (
    <div className="container max-w-md mx-auto py-6">
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex items-center">
            <Link href="/chat">
              <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <CardTitle>Create New Group</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          {selectedUsers.length > 0 && (
            <div className="text-sm text-slate-500">
              {selectedUsers.length}{" "}
              {selectedUsers.length === 1 ? "member" : "members"} selected
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleCreateGroup}
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Group"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
