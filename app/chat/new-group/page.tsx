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
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Search } from "lucide-react";
import { fetchClient } from "@/lib/api/client";

// Mock users data
const mockUsers = [
  {
    id: "user1",
    name: "Alex Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
  },
  {
    id: "user2",
    name: "Sam Wilson",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
  },
  {
    id: "user3",
    name: "Taylor Smith",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "away",
  },
  {
    id: "user4",
    name: "Jordan Lee",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
  },
  {
    id: "user5",
    name: "Casey Brown",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
  },
];

type User = {
  id: string;
  name: string;
};

export default function NewGroup() {
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
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

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      toast({
        title: "Group name required",
        description: "Please enter a name for your group",
        variant: "destructive",
      });
      return;
    }

    if (selectedUsers.length < 1) {
      toast({
        title: "Select members",
        description: "Please select at least one member for your group",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simulate API call to create group
    // setTimeout(() => {
    //   setIsLoading(false);
    //   toast({
    //     title: "Group created",
    //     description: `Created group "${groupName}" with ${selectedUsers.length} members`,
    //   });
    //   router.push("/chat/group/group1");
    // }, 1000);

    // Create group API call
    const createGroup = async () => {
      try {
        const chatPayload = {
          name: groupName,
          type: "Group",
          users: [...selectedUsers, currentUserId],
        };

        const res = await fetchClient.POST("/chats", {
          body: chatPayload,
        });

        setIsLoading(false);
        toast({
          title: "Group created",
          description: `Created group "${groupName}" with ${selectedUsers.length} members`,
        });
        router.push(`/chat/group/${res.data?.id}`);
      } catch (error) {
        setIsLoading(false);
        toast({
          title: "Error",
          description: "Failed to create group",
          variant: "destructive",
        });
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

          <div className="space-y-2">
            <Label>Add Members</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search users"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="border rounded-md">
            <div className="max-h-60 overflow-y-auto p-1">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded-md"
                >
                  <Checkbox
                    id={`user-${user.id}`}
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={() => toggleUserSelection(user.id)}
                  />
                  <Label
                    htmlFor={`user-${user.id}`}
                    className="flex items-center space-x-2 flex-1 cursor-pointer"
                  >
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={"/placeholder.svg"} alt={user.name} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <span
                        className={`absolute bottom-0 right-0 h-2 w-2 rounded-full ring-1 ring-white ${"bg-green-500"}`}
                      />
                    </div>
                    <span>{user.name}</span>
                  </Label>
                </div>
              ))}

              {filteredUsers.length === 0 && (
                <div className="p-4 text-center text-slate-500">
                  No users found
                </div>
              )}
            </div>
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
