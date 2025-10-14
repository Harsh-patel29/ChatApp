import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { authClient } from "@/lib/client";

const WS_URL = "http://localhost:5000";

export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const hasConnected = useRef(false);

  useEffect(() => {
    let isMounted = true;

    async function connectWebSocket() {
      const session = await authClient.getSession();

      if (hasConnected.current || !session?.data) {
        return;
      }

      hasConnected.current = true;

      const socket = io(WS_URL, {
        auth: { token: session.data },
        withCredentials: true,
      });

      socket.on("connect", () => {
        if (!isMounted) return;
        console.log("✅ WebSocket connected:", socket.id);
        setIsConnected(true);
      });

      socket.on("disconnect", () => {
        if (!isMounted) return;
        console.log("❌ WebSocket disconnected");
        setIsConnected(false);
      });

      socket.on("error", (error) => {
        console.log("WebSocket error", error);
      });

      socketRef.current = socket;
    }

    connectWebSocket();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        console.log("Disconnecting old socket");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const emit = (event: string, data?: any) => {
    socketRef.current?.emit(event, data);
  };

  const on = (event: string, callback: (data: any) => void) => {
    socketRef.current?.on(event, callback);
  };

  const off = (event: string, callback: (data: any) => void) => {
    socketRef.current?.off(event, callback);
  };

  return { socket: socketRef.current, isConnected, emit, on, off };
}
