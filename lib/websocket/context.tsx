"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ReactNode } from "react";
import { fetchClient } from "@/lib/api/client";
import useWebSocket from "react-use-websocket";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { WebSocketEvent } from "@/lib/websocket/type";

// context type
interface SocketContextProps {
  sendJsonMessage: (message: WebSocketEvent) => void;
  lastJsonMessage: WebSocketEvent | null;
  readyState: number;
  connectWebsocket: () => void;
  disconnectWebsocket: () => void;
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

  async function connectWebsocket() {
    const res = await fetchClient.GET("/users/me");
    if (!res.response.ok) {
      console.error("Unauthorized access, please sign in again.");
      return;
    }
    const userId = res.data?.id;
    if (!userId) throw Error("This should not happen, unable to get user id");
    setConnectedUserId(userId);

    initWs();
  }

  async function disconnectWebsocket() {
    const socket = getWebSocket();
    if (socket) {
      socket.close();
    }
    setIsEnableWs(false);
    setConnectedUserId(null);
  }

  useEffect(() => {

    onAuthStateChanged(auth, (user) => {
      if (user) {
        connectWebsocket();
      } else {
        disconnectWebsocket();
      }
    })

    return () => {
      disconnectWebsocket();
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        sendJsonMessage,
        lastJsonMessage,
        readyState,
        connectWebsocket,
        disconnectWebsocket,
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
