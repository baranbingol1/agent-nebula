const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8484";

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export function wsUrl(roomId: string): string {
  const wsBase = import.meta.env.VITE_WS_BASE || API_BASE.replace(/^http/, "ws");
  return `${wsBase}/ws/${roomId}`;
}
