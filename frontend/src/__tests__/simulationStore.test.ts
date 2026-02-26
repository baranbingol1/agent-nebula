import { describe, it, expect, beforeEach } from "vitest";
import { useSimulationStore } from "../stores/simulationStore";
import type { Message } from "../types";

const makeMessage = (id: string, content: string, roomId = "room-1"): Message => ({
  id,
  room_id: roomId,
  agent_id: "agent-1",
  role: "assistant",
  content,
  turn_number: 0,
  created_at: new Date().toISOString(),
  agent_name: "Bot",
});

describe("simulationStore", () => {
  beforeEach(() => {
    const store = useSimulationStore.getState();
    store.clearRoom("room-1");
    store.clearRoom("room-2");
  });

  describe("addMessage", () => {
    it("adds a message to a room", () => {
      const store = useSimulationStore.getState();
      const msg = makeMessage("m1", "Hello");

      store.addMessage("room-1", msg);

      const messages = useSimulationStore.getState().messages["room-1"];
      expect(messages).toHaveLength(1);
      expect(messages[0].content).toBe("Hello");
    });

    it("appends to existing messages", () => {
      const store = useSimulationStore.getState();
      store.addMessage("room-1", makeMessage("m1", "First"));
      store.addMessage("room-1", makeMessage("m2", "Second"));

      const messages = useSimulationStore.getState().messages["room-1"];
      expect(messages).toHaveLength(2);
    });

    it("clears typing indicator when adding message", () => {
      const store = useSimulationStore.getState();
      store.setTyping("room-1", { agent_id: "a1", agent_name: "Bot" });
      store.addMessage("room-1", makeMessage("m1", "Done typing"));

      expect(useSimulationStore.getState().typingAgent["room-1"]).toBeNull();
    });

    it("isolates messages between rooms", () => {
      const store = useSimulationStore.getState();
      store.addMessage("room-1", makeMessage("m1", "R1 message", "room-1"));
      store.addMessage("room-2", makeMessage("m2", "R2 message", "room-2"));

      expect(useSimulationStore.getState().messages["room-1"]).toHaveLength(1);
      expect(useSimulationStore.getState().messages["room-2"]).toHaveLength(1);
    });
  });

  describe("setMessages", () => {
    it("replaces all messages for a room", () => {
      const store = useSimulationStore.getState();
      store.addMessage("room-1", makeMessage("m1", "Old"));

      store.setMessages("room-1", [
        makeMessage("m2", "New1"),
        makeMessage("m3", "New2"),
      ]);

      const messages = useSimulationStore.getState().messages["room-1"];
      expect(messages).toHaveLength(2);
      expect(messages[0].content).toBe("New1");
    });

    it("can set empty messages", () => {
      const store = useSimulationStore.getState();
      store.addMessage("room-1", makeMessage("m1", "Something"));
      store.setMessages("room-1", []);

      expect(useSimulationStore.getState().messages["room-1"]).toHaveLength(0);
    });
  });

  describe("setStatus", () => {
    it("sets room status", () => {
      const store = useSimulationStore.getState();
      store.setStatus("room-1", "running");

      expect(useSimulationStore.getState().roomStatus["room-1"]).toBe("running");
    });

    it("updates existing status", () => {
      const store = useSimulationStore.getState();
      store.setStatus("room-1", "running");
      store.setStatus("room-1", "paused");

      expect(useSimulationStore.getState().roomStatus["room-1"]).toBe("paused");
    });
  });

  describe("setTyping", () => {
    it("sets typing agent", () => {
      const store = useSimulationStore.getState();
      store.setTyping("room-1", { agent_id: "a1", agent_name: "Bot" });

      const typing = useSimulationStore.getState().typingAgent["room-1"];
      expect(typing).toEqual({ agent_id: "a1", agent_name: "Bot" });
    });

    it("clears typing with null", () => {
      const store = useSimulationStore.getState();
      store.setTyping("room-1", { agent_id: "a1", agent_name: "Bot" });
      store.setTyping("room-1", null);

      expect(useSimulationStore.getState().typingAgent["room-1"]).toBeNull();
    });
  });

  describe("setTurnInfo", () => {
    it("sets current and max turns", () => {
      const store = useSimulationStore.getState();
      store.setTurnInfo("room-1", 5, 20);

      const state = useSimulationStore.getState();
      expect(state.currentTurn["room-1"]).toBe(5);
      expect(state.maxTurns["room-1"]).toBe(20);
    });

    it("updates turn info", () => {
      const store = useSimulationStore.getState();
      store.setTurnInfo("room-1", 5, 20);
      store.setTurnInfo("room-1", 10, 20);

      expect(useSimulationStore.getState().currentTurn["room-1"]).toBe(10);
    });
  });

  describe("clearRoom", () => {
    it("resets all state for a room", () => {
      const store = useSimulationStore.getState();
      store.addMessage("room-1", makeMessage("m1", "Hello"));
      store.setStatus("room-1", "running");
      store.setTyping("room-1", { agent_id: "a1", agent_name: "Bot" });
      store.setTurnInfo("room-1", 5, 20);

      store.clearRoom("room-1");

      const state = useSimulationStore.getState();
      expect(state.messages["room-1"]).toEqual([]);
      expect(state.roomStatus["room-1"]).toBe("idle");
      expect(state.typingAgent["room-1"]).toBeNull();
      expect(state.currentTurn["room-1"]).toBe(0);
      expect(state.maxTurns["room-1"]).toBe(0);
    });

    it("does not affect other rooms", () => {
      const store = useSimulationStore.getState();
      store.addMessage("room-1", makeMessage("m1", "R1"));
      store.addMessage("room-2", makeMessage("m2", "R2", "room-2"));

      store.clearRoom("room-1");

      expect(useSimulationStore.getState().messages["room-1"]).toEqual([]);
      expect(useSimulationStore.getState().messages["room-2"]).toHaveLength(1);
    });
  });
});
