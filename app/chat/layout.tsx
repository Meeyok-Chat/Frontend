import type React from "react"
import { MainNav } from "@/components/main-nav"
import { Sidebar } from "@/components/sidebar"
import { UserProvider } from "@/components/user-provider"

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UserProvider>
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </UserProvider>
  )
}
