import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OnlineUsersList } from "@/components/online-users-list"
import { RecentChats } from "@/components/recent-chats"
import { GroupsList } from "@/components/groups-list"
import { FriendsList } from "@/components/friends-list"
import { FriendsFeed } from "@/components/friends-feed"
import Link from "next/link"

export default function ChatDashboard() {
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

          <Tabs defaultValue="recent">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="recent">Recent Chats</TabsTrigger>
              <TabsTrigger value="groups">Groups</TabsTrigger>
              <TabsTrigger value="feed">Friends Feed</TabsTrigger>
            </TabsList>
            <TabsContent value="recent" className="mt-4">
              <RecentChats />
            </TabsContent>
            <TabsContent value="groups" className="mt-4">
              <GroupsList />
            </TabsContent>
            <TabsContent value="feed" className="mt-4">
              <FriendsFeed />
            </TabsContent>
          </Tabs>
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
