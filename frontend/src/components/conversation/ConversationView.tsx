import { useEffect, useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { messagesApi } from "../../api/messages";
import { simulationApi } from "../../api/simulation";
import { useWebSocket } from "../../hooks/useWebSocket";
import { useSimulationStore } from "../../stores/simulationStore";
import MessageList from "./MessageList";
import ControlBar from "./ControlBar";
import InjectMessageInput from "./InjectMessageInput";
import TypingIndicator from "./TypingIndicator";
import type { Room } from "../../types";

interface ConversationViewProps {
  room: Room;
}

export default function ConversationView({ room }: ConversationViewProps) {
  const messages = useSimulationStore((s) => s.messages[room.id] || []);
  const status = useSimulationStore((s) => s.roomStatus[room.id] || room.status);
  const typing = useSimulationStore((s) => s.typingAgent[room.id] || null);
  const currentTurn = useSimulationStore((s) => s.currentTurn[room.id] ?? room.current_turn_index);
  const maxTurns = useSimulationStore((s) => s.maxTurns[room.id] ?? room.max_turns);
  const { addMessage, setMessages, setStatus, setTyping, setTurnInfo, clearRoom } = useSimulationStore.getState();
  const [error, setError] = useState<string | null>(null);

  // Initialize store from room props
  useEffect(() => {
    setStatus(room.id, room.status);
    setTurnInfo(room.id, room.current_turn_index, room.max_turns);
    return () => { clearRoom(room.id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- store actions are stable, room props only needed on mount
  }, [room.id]);

  // WebSocket for live updates
  const { connected } = useWebSocket(room.id, {
    onMessage: (msg) => addMessage(room.id, msg),
    onStatus: (s, turn, max) => {
      setStatus(room.id, s);
      if (turn !== undefined && max !== undefined) setTurnInfo(room.id, turn, max);
    },
    onTyping: (agent) => setTyping(room.id, agent),
  });

  // Load existing messages
  const { data: historyData } = useQuery({
    queryKey: ["messages", room.id],
    queryFn: () => messagesApi.list(room.id, 500),
  });

  useEffect(() => {
    if (historyData?.messages) {
      setMessages(room.id, historyData.messages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- store action is stable
  }, [historyData, room.id]);

  const handleStart = useCallback(async () => {
    try {
      setError(null);
      await simulationApi.start(room.id);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to start simulation";
      console.error("Failed to start:", e);
      setError(msg);
    }
  }, [room.id]);

  const handlePause = useCallback(async () => {
    try {
      setError(null);
      await simulationApi.pause(room.id);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to pause simulation";
      console.error("Failed to pause:", e);
      setError(msg);
    }
  }, [room.id]);

  const handleResume = useCallback(async () => {
    try {
      setError(null);
      await simulationApi.resume(room.id);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to resume simulation";
      console.error("Failed to resume:", e);
      setError(msg);
    }
  }, [room.id]);

  const handleStop = useCallback(async () => {
    try {
      setError(null);
      await simulationApi.stop(room.id);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to stop simulation";
      console.error("Failed to stop:", e);
      setError(msg);
    }
  }, [room.id]);

  const handleInject = useCallback(async (content: string) => {
    try {
      setError(null);
      await simulationApi.inject(room.id, content);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to inject message";
      console.error("Failed to inject:", e);
      setError(msg);
    }
  }, [room.id]);

  const isActive = status === "running" || status === "paused";

  return (
    <div className="flex flex-col h-full bg-nebula-900/50 rounded-xl border border-nebula-600/20 overflow-hidden">
      {!connected && (
        <div className="bg-yellow-500/20 border-b border-yellow-500/50 px-3 py-2 text-yellow-200 text-sm flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
          Reconnecting to server...
        </div>
      )}
      {error && (
        <div className="bg-red-500/20 border-b border-red-500/50 p-3 text-red-200 text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="hover:text-white">&times;</button>
        </div>
      )}
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
