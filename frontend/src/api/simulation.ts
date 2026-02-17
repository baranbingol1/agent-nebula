import { apiFetch } from "./client";
import type { SimulationStatus } from "../types";

export const simulationApi = {
  start: (roomId: string) =>
    apiFetch<{ status: string }>(`/api/simulation/${roomId}/start`, {
      method: "POST",
    }),
  pause: (roomId: string) =>
    apiFetch<{ status: string }>(`/api/simulation/${roomId}/pause`, {
      method: "POST",
    }),
  resume: (roomId: string) =>
    apiFetch<{ status: string }>(`/api/simulation/${roomId}/resume`, {
      method: "POST",
    }),
  stop: (roomId: string) =>
    apiFetch<{ status: string }>(`/api/simulation/${roomId}/stop`, {
      method: "POST",
    }),
  inject: (roomId: string, content: string) =>
    apiFetch<{ status: string }>(`/api/simulation/${roomId}/inject`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
  status: (roomId: string) =>
    apiFetch<SimulationStatus>(`/api/simulation/${roomId}/status`),
};
