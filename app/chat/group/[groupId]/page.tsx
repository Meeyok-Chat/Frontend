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
import { EventType, WSMessageEvent } from "@/lib/websocket/type";
import Tag from "@/components/ui/tag";

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

  async function fetchUser(userId: string) {
    const data = await fetchClient.GET("/users/{id}", {
      params: { path: { id: userId } },
    });
    if (!data || !data.data) {
      console.log("Error fetching user data", data.error);
      return null;
    }
    return data.data;
  }

  async function fetchAllUsers() {
    const data = await fetchClient.GET("/users/me");
    if (!data || !data.data) {
      console.log("Error fetching user data");
      return;
    }
    setMyUser(data.data);

    if (!group || !group.users) return;
    try {
      const allMemberResponses = await Promise.all(
        group.users.map((memberId) => fetchUser(memberId))
      );

      const validMembers = allMemberResponses.filter(
        (member) => member !== null
      );
      setMemberDatas(validMembers);
      return validMembers;
    } catch (error) {
      console.error("Error fetching member data:", error);
    }
  }

  async function fetchMessages() {
    // Fetch chat history
    if (!group || messages.length != 0) return;

    const fetchedMessages: Message[] =
      group.messages?.map((msg: components["schemas"]["models.Message"]) => {
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
      }) || [];

    setMessages(fetchedMessages);
  }

  const maybeAddUserToGroup = async () => {
    if (
      !group ||
      !myUser ||
      !group.users ||
      !myUser.id ||
      group.users?.includes(myUser.id)
    )
      return;

    try {
      // Add user to group
      await fetchClient.POST("/chats/{id}/users", {
        params: { path: { id: groupId } },
        body: {
          users: [myUser.id],
        },
      });

      // Optionally update state to reflect the change
      setGroup({ ...group, users: [...group.users, myUser.id] });
    } catch (err) {
      console.error("Failed to add user to group:", err);
    }
  };

  const fetchGroupData = async () => {
    try {
      // Fetch group info
      const currentGroup = await fetchClient.GET("/chats/{id}", {
        params: {
          path: { id: groupId },
        },
      });

      if (!currentGroup.data) {
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

      setGroup(currentGroup.data);
    } catch (error) {
      console.error("Error fetching group or chat history:", error);
    }
  };

  // Fetching group data
  useEffect(() => {
    if (groupId) {
      fetchGroupData();
    }
  }, [groupId]);

  useEffect(() => {
    if (!group) return;
    fetchAllUsers();
  }, [group]);

  useEffect(() => {
    if (!memberDatas) return;
    fetchMessages();
    maybeAddUserToGroup();
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

  async function appendMessage(messageEvent: WSMessageEvent) {
    const isKnownSender = memberDatas.some(
      (member) => member.id === messageEvent.from
    );

    let memberList = memberDatas;
    if (!isKnownSender) {
      await fetchGroupData();
      const unknownSender = await fetchUser(messageEvent.from);
      if (unknownSender) {
        memberList = [...memberDatas, unknownSender];
        setMemberDatas(memberList);
      } else {
        console.warn("Unknown sender:", messageEvent.from);
        return;
      }
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: messageEvent.from,
      senderName:
        memberList.find((member) => member.id === messageEvent.from)
          ?.username || "Unknown",
      text: messageEvent.message,
      timestamp: new Date(messageEvent.createAt),
    };

    const isDuplicate = messages.some(
      (msg) =>
        msg.senderId === newMessage.senderId && msg.text === newMessage.text
    );
    if (isDuplicate) return;
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  }

  useEffect(() => {
    if (!lastJsonMessage) return;

    if (lastJsonMessage.type === EventType.EVENT_NEW_MESSAGE) {
      const payload = lastJsonMessage.payload as WSMessageEvent;
      if (payload.chat_id !== groupId) return;

      appendMessage(payload);
    }
  }, [lastJsonMessage]);

  if (!group || !memberDatas) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <Card className="flex flex-col h-full">
        <CardHeader className="flex flex-row items-center pb-4 border-b justify-between gap-2">
          <div className="flex flex-row items-center gap-4">
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
            <Tag type="Group" className="text-xs" />
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMembers(!showMembers)}
            aria-label="Show members"
            className="w-fit px-1 flex-shrink-0"
          >
            <Users className="h-4 w-4" />
            <span className="">Show members</span>
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
                    {memberDatas.map((member) => (
                      <li key={member.id} className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src="/placeholder.svg?height=40&width=40"
                            alt={member.username}
                          />
                          <AvatarFallback>{member.username}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.username}</p>
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
