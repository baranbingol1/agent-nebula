import { apiFetch } from "./client";
import type { Message } from "../types";

export const messagesApi = {
  list: (roomId: string, limit = 100, offset = 0) =>
    apiFetch<{ messages: Message[]; total: number }>(
      `/api/messages/${roomId}?limit=${limit}&offset=${offset}`
    ),
};
