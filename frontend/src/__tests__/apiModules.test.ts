import { describe, it, expect, vi, beforeEach } from "vitest";
import { agentsApi } from "../api/agents";
import { roomsApi } from "../api/rooms";
import { simulationApi } from "../api/simulation";
import { messagesApi } from "../api/messages";

function mockFetch(data: unknown, status = 200) {
  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  } as Response);
}

function mockFetch204() {
  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    status: 204,
    json: () => Promise.resolve(undefined),
    text: () => Promise.resolve(""),
  } as Response);
}

describe("agentsApi", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("list calls GET /api/agents", async () => {
    mockFetch([]);
    await agentsApi.list();
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8484/api/agents",
      expect.any(Object)
    );
  });

  it("get calls GET /api/agents/:id", async () => {
    mockFetch({ id: "1" });
    await agentsApi.get("1");
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8484/api/agents/1",
      expect.any(Object)
    );
  });

  it("create calls POST /api/agents", async () => {
    mockFetch({ id: "1" }, 201);
    await agentsApi.create({ name: "Bot", system_prompt: "p", model: "m" });
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8484/api/agents",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("update calls PUT /api/agents/:id", async () => {
    mockFetch({ id: "1" });
    await agentsApi.update("1", { name: "New" });
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8484/api/agents/1",
      expect.objectContaining({ method: "PUT" })
    );
  });

  it("delete calls DELETE /api/agents/:id", async () => {
    mockFetch204();
    await agentsApi.delete("1");
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8484/api/agents/1",
      expect.objectContaining({ method: "DELETE" })
    );
  });
});

describe("roomsApi", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("list calls GET /api/rooms", async () => {
    mockFetch([]);
    await roomsApi.list();
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8484/api/rooms",
      expect.any(Object)
    );
  });

  it("get calls GET /api/rooms/:id", async () => {
    mockFetch({ id: "r1" });
    await roomsApi.get("r1");
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8484/api/rooms/r1",
      expect.any(Object)
    );
  });

  it("create calls POST /api/rooms", async () => {
    mockFetch({ id: "r1" }, 201);
    await roomsApi.create({ name: "Room" });
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8484/api/rooms",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("addAgent calls POST /api/rooms/:id/agents", async () => {
    mockFetch({ id: "r1" }, 201);
    await roomsApi.addAgent("r1", "a1");
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8484/api/rooms/r1/agents",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("removeAgent calls DELETE /api/rooms/:id/agents/:agentId", async () => {
    mockFetch({ id: "r1" });
    await roomsApi.removeAgent("r1", "a1");
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8484/api/rooms/r1/agents/a1",
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("reorderAgents calls PUT /api/rooms/:id/agents/reorder", async () => {
    mockFetch({ id: "r1" });
    await roomsApi.reorderAgents("r1", ["a2", "a1"]);
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8484/api/rooms/r1/agents/reorder",
      expect.objectContaining({ method: "PUT" })
    );
  });
});

describe("simulationApi", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("start calls POST /api/simulation/:id/start", async () => {
    mockFetch({ status: "started" });
    await simulationApi.start("r1");
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8484/api/simulation/r1/start",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("pause calls POST /api/simulation/:id/pause", async () => {
    mockFetch({ status: "paused" });
    await simulationApi.pause("r1");
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8484/api/simulation/r1/pause",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("resume calls POST /api/simulation/:id/resume", async () => {
    mockFetch({ status: "resumed" });
    await simulationApi.resume("r1");
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8484/api/simulation/r1/resume",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("stop calls POST /api/simulation/:id/stop", async () => {
    mockFetch({ status: "stopped" });
    await simulationApi.stop("r1");
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8484/api/simulation/r1/stop",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("inject calls POST /api/simulation/:id/inject", async () => {
    mockFetch({ status: "injected" });
    await simulationApi.inject("r1", "Hello");
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8484/api/simulation/r1/inject",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("status calls GET /api/simulation/:id/status", async () => {
    mockFetch({ room_id: "r1", status: "idle" });
    await simulationApi.status("r1");
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8484/api/simulation/r1/status",
      expect.any(Object)
    );
  });
});

describe("messagesApi", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("list calls GET /api/messages/:id with defaults", async () => {
    mockFetch({ messages: [], total: 0 });
    await messagesApi.list("r1");
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8484/api/messages/r1?limit=100&offset=0",
      expect.any(Object)
    );
  });

  it("list calls with custom pagination", async () => {
    mockFetch({ messages: [], total: 0 });
    await messagesApi.list("r1", 50, 10);
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8484/api/messages/r1?limit=50&offset=10",
      expect.any(Object)
    );
  });
});
