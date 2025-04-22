"use client"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Home, MessageSquare, Users, UserPlus, Settings, UserCheck } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const sidebarItems = [
  {
    title: "Dashboard",
    icon: Home,
    href: "/chat",
  },
  {
    title: "New Chat",
    icon: MessageSquare,
    href: "/chat/new",
  },
  {
    title: "New Group",
    icon: Users,
    href: "/chat/new-group",
  },
  {
    title: "Add Friend",
    icon: UserPlus,
    href: "/chat/add-friend",
  },
  {
    title: "Friend Requests",
    icon: UserCheck,
    href: "/chat/pending-requests",
  },
  // {
  //   title: "Settings",
  //   icon: Settings,
  //   href: "/settings",
  // },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden border-r bg-white md:block md:w-64">
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="flex h-full flex-col gap-2 p-4">
          <nav className="grid gap-1">
            {sidebarItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-slate-500 transition-all hover:text-slate-900",
                  pathname === item.href && "bg-slate-100 text-slate-900",
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>
        </div>
      </ScrollArea>
    </aside>
  )
}
