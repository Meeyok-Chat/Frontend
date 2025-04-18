import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Meeyok Chat</h1>
          <p className="mt-2 text-slate-600">Connect with friends in real-time</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Choose how you want to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <Link href="/auth/signin" className="w-full">
                <Button className="w-full" variant="default">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup" className="w-full">
                <Button className="w-full" variant="outline">
                  Create Account
                </Button>
              </Link>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/chat" className="w-full">
              <Button variant="ghost" className="w-full">
                Continue as Guest
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
