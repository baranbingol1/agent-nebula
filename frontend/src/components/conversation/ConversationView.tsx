import { useEffect, useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { messagesApi } from "../../api/messages";
import { simulationApi } from "../../api/simulation";
import { useWebSocket } from "../../hooks/useWebSocket";
import MessageList from "./MessageList";
import ControlBar from "./ControlBar";
import InjectMessageInput from "./InjectMessageInput";
import TypingIndicator from "./TypingIndicator";
import type { Room, Message } from "../../types";

interface ConversationViewProps {
  room: Room;
}

export default function ConversationView({ room }: ConversationViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<string>(room.status);
  const [typing, setTyping] = useState<{ agent_id: string; agent_name: string } | null>(null);
  const [currentTurn, setCurrentTurn] = useState(room.current_turn_index);
  const [maxTurns, setMaxTurns] = useState(room.max_turns);

  // WebSocket for live updates
  useWebSocket(room.id, {
    onMessage: (msg) => {
      setMessages((prev) => [...prev, msg]);
      setTyping(null);
    },
    onStatus: (s, turn, max) => {
      setStatus(s);
      if (turn !== undefined) setCurrentTurn(turn);
      if (max !== undefined) setMaxTurns(max);
    },
    onTyping: (agent) => setTyping(agent),
  });

  // Load existing messages
  const { data: historyData } = useQuery({
    queryKey: ["messages", room.id],
    queryFn: () => messagesApi.list(room.id, 500),
  });

  useEffect(() => {
    if (historyData?.messages) {
      setMessages(historyData.messages);
    }
  }, [historyData]);

  const handleStart = useCallback(async () => {
    try {
      await simulationApi.start(room.id);
    } catch (e: any) {
      console.error("Failed to start:", e);
    }
  }, [room.id]);

  const handlePause = useCallback(async () => {
    try {
      await simulationApi.pause(room.id);
    } catch (e: any) {
      console.error("Failed to pause:", e);
    }
  }, [room.id]);

  const handleResume = useCallback(async () => {
    try {
      await simulationApi.resume(room.id);
    } catch (e: any) {
      console.error("Failed to resume:", e);
    }
  }, [room.id]);

  const handleStop = useCallback(async () => {
    try {
      await simulationApi.stop(room.id);
    } catch (e: any) {
      console.error("Failed to stop:", e);
    }
  }, [room.id]);

  const handleInject = useCallback(async (content: string) => {
    try {
      await simulationApi.inject(room.id, content);
    } catch (e: any) {
      console.error("Failed to inject:", e);
    }
  }, [room.id]);

  const isActive = status === "running" || status === "paused";

  return (
    <div className="flex flex-col h-full bg-nebula-900/50 rounded-xl border border-nebula-600/20 overflow-hidden">
      <ControlBar
        status={status}
        currentTurn={currentTurn}
        maxTurns={maxTurns}
        onStart={handleStart}
        onPause={handlePause}
        onResume={handleResume}
        onStop={handleStop}
      />
      <MessageList messages={messages} />
      {typing && (
        <TypingIndicator agentName={typing.agent_name} />
      )}
      <InjectMessageInput disabled={!isActive} onInject={handleInject} />
    </div>
  );
}
