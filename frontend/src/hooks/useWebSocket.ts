import { useEffect, useRef, useState } from "react";
import { wsUrl } from "../api/client";
import type { WSMessage, Message } from "../types";

interface WSCallbacks {
  onMessage: (message: Message) => void;
  onStatus: (status: string, currentTurn?: number, maxTurns?: number) => void;
  onTyping: (agent: { agent_id: string; agent_name: string }) => void;
}

const MAX_RETRIES = 10;
const BASE_DELAY = 1000;
const MAX_DELAY = 30000;

export function useWebSocket(roomId: string | undefined, callbacks: WSCallbacks) {
  const wsRef = useRef<WebSocket | null>(null);
  const cbRef = useRef(callbacks);
  const retriesRef = useRef(0);

  useEffect(() => {
    cbRef.current = callbacks;
  });
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const unmountedRef = useRef(false);
  const connectRef = useRef<(() => void) | undefined>(undefined);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    unmountedRef.current = false;
    retriesRef.current = 0;

    const connect = () => {
      if (!roomId || unmountedRef.current) return;

      const ws = new WebSocket(wsUrl(roomId));
      wsRef.current = ws;

      ws.onopen = () => {
        retriesRef.current = 0;
        setConnected(true);
      };

      ws.onmessage = (event) => {
        const data: WSMessage = JSON.parse(event.data);
        switch (data.type) {
          case "message":
            if (data.message) cbRef.current.onMessage(data.message);
            break;
          case "status":
            if (data.status) cbRef.current.onStatus(data.status, data.current_turn_index, data.max_turns);
            break;
          case "typing":
            if (data.agent_id && data.agent_name)
              cbRef.current.onTyping({ agent_id: data.agent_id, agent_name: data.agent_name });
            break;
          case "error":
            console.error("WS error:", data.error);
            break;
        }
      };

      ws.onclose = () => {
        setConnected(false);
        wsRef.current = null;
        if (unmountedRef.current) return;
        if (retriesRef.current < MAX_RETRIES) {
          const delay = Math.min(BASE_DELAY * 2 ** retriesRef.current, MAX_DELAY);
          retriesRef.current++;
          timerRef.current = setTimeout(() => connectRef.current?.(), delay);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connectRef.current = connect;
    connect();

    return () => {
      unmountedRef.current = true;
      clearTimeout(timerRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [roomId]);

  return { wsRef, connected };
}
