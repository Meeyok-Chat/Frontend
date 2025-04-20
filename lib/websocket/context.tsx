"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ReactNode } from "react";
import { fetchClient } from "@/lib/api/client";
import useWebSocket from "react-use-websocket";

// context type
interface SocketContextProps {
  setConnectedUserId: (userId: string) => void;
  sendJsonMessage: (message: WebSocketEvent) => void;
  lastJsonMessage: WebSocketEvent | null;
  readyState: number;
}

const SocketContext = createContext<SocketContextProps | null>(null);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [connectedUserId, setConnectedUserId] = useState<string | null>(null);
  const [isEnableWs, setIsEnableWs] = useState(false);

  const serverUrl = useMemo(
    () => process.env.NEXT_PUBLIC_BACKEND_URL + "/ws/" + connectedUserId,
    [connectedUserId]
  );
  const { sendJsonMessage, lastJsonMessage, readyState, getWebSocket } =
    useWebSocket<WebSocketEvent>(
      serverUrl,
      {
        onOpen: () => {
          console.log("WebSocket connection opened");
        },
        onClose: () => {
          console.log("WebSocket connection closed");
        },
        onError: (event) => {
          console.error("WebSocket error:", event);
        },
        shouldReconnect: (closeEvent) => {
          console.log("Should reconnect:", closeEvent);
          return true; // Return true to reconnect
        },

        onMessage: (event) => {
          console.log("WebSocket message received:", event.data);
        },
        reconnectAttempts: 1,
      },
      isEnableWs
    );

  function cleanup() {
    const socket = getWebSocket();
    if (socket) {
      socket.close();
    }
    setIsEnableWs(false);
    setConnectedUserId(null);
  }

  async function initWs() {
    const res = await fetchClient.GET("/ws/init");

    if (!res.response.ok) {
      console.error("Error while initializing websocket", res.response.text());
      return;
    } else {
      console.log("Websocket initialized");
    }

    setIsEnableWs(true);
  }

  useEffect(() => {
    if (!connectedUserId) {
      cleanup();
      return;
    }

    // Send /ws/init
    initWs();

    return () => {
      cleanup();
    };
  }, [connectedUserId]);

  return (
    <SocketContext.Provider
      value={{
        setConnectedUserId,
        sendJsonMessage,
        lastJsonMessage,
        readyState,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
