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
  const [showAddMembers, setShowAddMembers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [myUser, setMyUser] = useState<
    components["schemas"]["models.User"] | null
  >(null);
  const [memberDatas, setMemberDatas] = useState<
    components["schemas"]["models.User"][]
  >([]);
  const [friendlistDatas, setFriendlistDatas] = useState<
    components["schemas"]["models.User"][]
  >([]);

  async function fetchAllUsers() {
    const data = await fetchClient.GET("/users/me");
    if (!data || !data.data) {
      console.log("Error fetching user data");
      return null;
    }
    setMyUser(data.data);

    const allUserDatas = await Promise.all(
      group?.users?.map(async (member) => {
        const user = await fetchClient.GET(`/users/{id}`, {
          params: {
            path: { id: member },
          },
        });
        if (!user || !user.data) {
          console.log("Error fetching user data");
          return null;
        }
        return user.data;
      }) || []
    );

    setMemberDatas(allUserDatas.filter((user) => user !== null));
  }

  async function fetchFriendlist() {
    const data = await fetchClient.GET("/friendships/{status}", {
      params: {
        path: { status: "accepted" },
      },
    });
    if (!data || !data.data) {
      console.log("Error fetching user data");
      return null;
    }
    setFriendlistDatas(data.data);
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
      fetchGroupData().then(() => {
        fetchAllUsers();
        fetchFriendlist();
      });
    }
  }, [groupId]);

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

    setMessages([...messages, message]);
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

  // add friend to group
  const handleAddMember = async (userId: string) => {
    if (!group) return;

    const res = await fetchClient.POST("/chats/{id}/users", {
      params: {
        path: { id: groupId },
      },
      body: {
        users: [userId],
      },
    });

    if (!res || !res.data || res.response.status !== 200) {
      console.log("Error adding member to group");
      return;
    } else {
      const addedMember = friendlistDatas.find((user) => user.id === userId);
      if (!addedMember) {
        console.log("Error finding added member in friend list");
        return;
      }
      setMemberDatas((prevMembers) => [...prevMembers, addedMember]);
    }
  };

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
                    {friendlistDatas.map((user) => (
                      <li
                        key={user.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage
                              src={"/placeholder.svg"}
                              alt={user.username}
                            />
                            <AvatarFallback>
                              {user.username?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{user.username}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddMember(user.id || "")}
                        >
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
