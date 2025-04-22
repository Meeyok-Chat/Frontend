"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "./user-provider";
import { toast } from "react-toastify";
import { Skeleton } from "./ui/skeleton";
import { useAuth } from "@/lib/auth";

export function MainNav() {
  const { user, loading } = useUser();
  const router = useRouter();
  const { signout } = useAuth();

  const handleSignOut = async () => {
    await signout();
    toast("You have been signed out successfully", { type: "info" });
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-10 border-b bg-white">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Link href="/chat" className="flex items-center gap-2">
          <span className="text-xl font-bold">Meeyok Chat</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          {user && (
            <>
              <p className="text-sm text-slate-500">Welcome, {user.username}</p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <User className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {loading ? (
                        <div className="flex flex-col space-y-1">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-48" />
                        </div>
                      ) : (
                        <>
                          <p className="font-medium">{user.username}</p>
                          {user.email && (
                            <p className="w-[200px] truncate text-sm text-slate-500">
                              {user.email}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem> */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
