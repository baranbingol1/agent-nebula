import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiFetch, wsUrl } from "../api/client";

describe("wsUrl", () => {
  it("constructs WebSocket URL with room ID", () => {
    expect(wsUrl("room-123")).toBe("ws://localhost:8484/ws/room-123");
  });

  it("handles special characters in room ID", () => {
    expect(wsUrl("room-abc-def")).toBe("ws://localhost:8484/ws/room-abc-def");
  });
});

describe("apiFetch", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("makes GET request with correct URL", async () => {
    const mockResponse = { id: "1", name: "Test" };
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockResponse),
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    } as Response);

    const result = await apiFetch("/api/agents");
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8484/api/agents",
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it("makes POST request with body", async () => {
    const body = { name: "Bot", system_prompt: "p", model: "m" };
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ id: "1", ...body }),
      text: () => Promise.resolve(""),
    } as Response);

    await apiFetch("/api/agents", {
      method: "POST",
      body: JSON.stringify(body),
    });

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8484/api/agents",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(body),
      })
    );
  });

  it("returns undefined for 204 response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 204,
      json: () => Promise.resolve(undefined),
      text: () => Promise.resolve(""),
    } as Response);

    const result = await apiFetch("/api/agents/1", { method: "DELETE" });
    expect(result).toBeUndefined();
  });

  it("throws on error response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ detail: "Not found" }),
      text: () => Promise.resolve("Not found"),
    } as Response);

    await expect(apiFetch("/api/agents/nonexistent")).rejects.toThrow(
      "API error 404: Not found"
    );
  });

  it("throws on 500 error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve("Internal Server Error"),
    } as Response);

    await expect(apiFetch("/api/agents")).rejects.toThrow("API error 500");
  });
});
