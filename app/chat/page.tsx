"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OnlineUsersList } from "@/components/online-users-list"
import { RecentChats } from "@/components/recent-chats"
import { GroupsList } from "@/components/groups-list"
import { FriendsList } from "@/components/friends-list"
import { FriendsFeed } from "@/components/friends-feed"
import Link from "next/link"

export default function ChatDashboard() {
  const [activeTab, setActiveTab] = useState("recent")

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
        <div className="md:w-2/3 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Welcome to Meeyok Chat</CardTitle>
              <CardDescription>Start chatting with friends or join a group conversation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Link href="/chat/new-group">
                  <Button variant="outline">Create Group</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="w-full">
            <div className="grid w-full grid-cols-3 border-b">
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "recent"
                    ? "border-b-2 border-blue-500 text-gray-900"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("recent")}
              >
                Recent Chats
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "groups"
                    ? "border-b-2 border-blue-500 text-gray-900"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("groups")}
              >
                Groups
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "feed"
                    ? "border-b-2 border-blue-500 text-gray-900"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("feed")}
              >
                Friends Feed
              </button>
            </div>
            <div className="mt-4">
              {activeTab === "recent" && <RecentChats />}
              {activeTab === "groups" && <GroupsList />}
              {activeTab === "feed" && <FriendsFeed />}
            </div>
          </div>
        </div>

        <div className="md:w-1/3 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Online Users</CardTitle>
              <CardDescription>See who's currently online</CardDescription>
            </CardHeader>
            <CardContent>
              <OnlineUsersList />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Friends</CardTitle>
              <CardDescription>Manage your friends list</CardDescription>
            </CardHeader>
            <CardContent>
              <FriendsList />
              <div className="mt-4">
                <Link href="/chat/add-friend">
                  <Button variant="outline" size="sm" className="w-full">
                    Add Friend
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}