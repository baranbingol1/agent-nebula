import { apiFetch } from "./client";
import type { Room, RoomCreate, RoomUpdate } from "../types";

export const roomsApi = {
  list: () => apiFetch<Room[]>("/api/rooms"),
  get: (id: string) => apiFetch<Room>(`/api/rooms/${id}`),
  create: (data: RoomCreate) =>
    apiFetch<Room>("/api/rooms", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: RoomUpdate) =>
    apiFetch<Room>(`/api/rooms/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiFetch<void>(`/api/rooms/${id}`, { method: "DELETE" }),
  addAgent: (roomId: string, agentId: string) =>
    apiFetch<Room>(`/api/rooms/${roomId}/agents`, {
      method: "POST",
      body: JSON.stringify({ agent_id: agentId }),
    }),
  removeAgent: (roomId: string, agentId: string) =>
    apiFetch<Room>(`/api/rooms/${roomId}/agents/${agentId}`, {
      method: "DELETE",
    }),
  reorderAgents: (roomId: string, agentIds: string[]) =>
    apiFetch<Room>(`/api/rooms/${roomId}/agents/reorder`, {
      method: "PUT",
      body: JSON.stringify({ agent_ids: agentIds }),
    }),
};
