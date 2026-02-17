import { apiFetch } from "./client";
import type { Agent, AgentCreate, AgentUpdate } from "../types";

export const agentsApi = {
  list: () => apiFetch<Agent[]>("/api/agents"),
  get: (id: string) => apiFetch<Agent>(`/api/agents/${id}`),
  create: (data: AgentCreate) =>
    apiFetch<Agent>("/api/agents", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: AgentUpdate) =>
    apiFetch<Agent>(`/api/agents/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiFetch<void>(`/api/agents/${id}`, { method: "DELETE" }),
};
