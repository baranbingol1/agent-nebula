import { useEffect, useRef } from "react";
import { wsUrl } from "../api/client";
import type { WSMessage, Message } from "../types";

interface WSCallbacks {
  onMessage: (message: Message) => void;
  onStatus: (status: string, currentTurn?: number, maxTurns?: number) => void;
  onTyping: (agent: { agent_id: string; agent_name: string }) => void;
}

export function useWebSocket(roomId: string | undefined, callbacks: WSCallbacks) {
  const wsRef = useRef<WebSocket | null>(null);
  const cbRef = useRef(callbacks);
  cbRef.current = callbacks;

  useEffect(() => {
    if (!roomId) return;

    const ws = new WebSocket(wsUrl(roomId));
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data: WSMessage = JSON.parse(event.data);

      switch (data.type) {
        case "message":
          if (data.message) {
            cbRef.current.onMessage(data.message);
          }
          break;
        case "status":
          if (data.status) {
            cbRef.current.onStatus(data.status, data.current_turn_index, data.max_turns);
          }
          break;
        case "typing":
          if (data.agent_id && data.agent_name) {
            cbRef.current.onTyping({
              agent_id: data.agent_id,
              agent_name: data.agent_name,
            });
          }
          break;
        case "error":
          console.error("WS error:", data.error);
          break;
      }
    };

    ws.onerror = () => {
      console.error("WebSocket error");
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [roomId]);

  return wsRef;
}
