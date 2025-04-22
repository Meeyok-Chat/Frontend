import type React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Inter } from "next/font/google";
import "./globals.css";
import { SocketProvider } from "@/lib/websocket/context";
import { ToastContainer, toast } from 'react-toastify';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Meeyok Chat",
  description: "A modern chat application",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SocketProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <ToastContainer/>

            {/* Toaster below is deprecated */}
            <Toaster />
          </ThemeProvider>
        </SocketProvider>
      </body>
    </html>
  );
}
