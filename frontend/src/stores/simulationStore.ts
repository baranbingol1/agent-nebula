import { create } from "zustand";
import type { Message } from "../types";

interface SimulationState {
  messages: Record<string, Message[]>;
  roomStatus: Record<string, string>;
  typingAgent: Record<string, { agent_id: string; agent_name: string } | null>;
  currentTurn: Record<string, number>;
  maxTurns: Record<string, number>;

  addMessage: (roomId: string, message: Message) => void;
  setMessages: (roomId: string, messages: Message[]) => void;
  setStatus: (roomId: string, status: string) => void;
  setTyping: (roomId: string, typing: { agent_id: string; agent_name: string } | null) => void;
  setTurnInfo: (roomId: string, current: number, max: number) => void;
  clearRoom: (roomId: string) => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  messages: {},
  roomStatus: {},
  typingAgent: {},
  currentTurn: {},
  maxTurns: {},

  addMessage: (roomId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [roomId]: [...(state.messages[roomId] || []), message],
      },
      typingAgent: { ...state.typingAgent, [roomId]: null },
    })),

  setMessages: (roomId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [roomId]: messages },
    })),

  setStatus: (roomId, status) =>
    set((state) => ({
      roomStatus: { ...state.roomStatus, [roomId]: status },
    })),

  setTyping: (roomId, typing) =>
    set((state) => ({
      typingAgent: { ...state.typingAgent, [roomId]: typing },
    })),

  setTurnInfo: (roomId, current, max) =>
    set((state) => ({
      currentTurn: { ...state.currentTurn, [roomId]: current },
      maxTurns: { ...state.maxTurns, [roomId]: max },
    })),

  clearRoom: (roomId) =>
    set((state) => ({
      messages: { ...state.messages, [roomId]: [] },
      roomStatus: { ...state.roomStatus, [roomId]: "idle" },
      typingAgent: { ...state.typingAgent, [roomId]: null },
      currentTurn: { ...state.currentTurn, [roomId]: 0 },
      maxTurns: { ...state.maxTurns, [roomId]: 0 },
    })),
}));
