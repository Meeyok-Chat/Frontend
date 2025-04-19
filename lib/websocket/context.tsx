"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";
import { ReactNode } from "react";
import { fetchClient } from "@/lib/api/client";

// context type
type SocketContext = {
  socket: Socket | null;
  setConnectedUserId: (userId: string) => void;
};

const SocketContext = createContext<SocketContext | null>(null);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectedUserId, setConnectedUserId] = useState<string | null>(null);
  const serverUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  function cleanup() {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  }

  async function initWs() {
    if (connectedUserId) return;
    const res = await fetchClient.GET("/ws/init");

    if (!res.response.ok) {
      console.error("Error while initializing websocket", res.response.text());
      return;
    } else {
      console.log("Websocket initialized");
    }
  }

  useEffect(() => {
    if (!connectedUserId) {
      cleanup();
      return;
    }

    // Send /ws/init
    initWs();

    // Initialize Socket.IO client
    const socketInstance = io(serverUrl, {
      path: `ws/${connectedUserId}`,
      reconnection: true,
      retries: 3,
    });
    setSocket(socketInstance);

    // Clean up on unmount
    return () => {
      cleanup();
    };
  }, [connectedUserId]);

  //   useEffect(() => {
  //     async function initWs() {
  //       if (isInitWs) return;
  //       const res = await fetchClient.POST("/ws/init");

  //       if (!res.response.ok) {
  //         console.error(
  //           "Error while initializing websocket",
  //           res.response.text()
  //         );
  //         return;
  //       } else {
  //         console.log("Websocket initialized");
  //         setIsInitWs(true);
  //       }
  //     }

  //     if (!socket || !isInitWs) initWs();
  //   }, []);

  return (
    <SocketContext.Provider value={{ socket, setConnectedUserId }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context.socket;
};
