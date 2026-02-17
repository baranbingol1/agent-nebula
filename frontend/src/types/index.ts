export interface Agent {
  id: string;
  name: string;
  system_prompt: string;
  model: string;
  avatar_id: string;
  created_at: string;
}

export interface AgentCreate {
  name: string;
  system_prompt: string;
  model: string;
  avatar_id: string;
}

export interface AgentUpdate {
  name?: string;
  system_prompt?: string;
  model?: string;
  avatar_id?: string;
}

export interface RoomAgentInfo {
  agent_id: string;
  turn_order: number;
  agent: Agent;
}

export interface Room {
  id: string;
  name: string;
  description: string | null;
  status: "idle" | "running" | "paused" | "stopped";
  current_turn_index: number;
  max_turns: number;
  created_at: string;
  agents: RoomAgentInfo[];
}

export interface RoomCreate {
  name: string;
  description?: string;
  max_turns?: number;
}

export interface RoomUpdate {
  name?: string;
  description?: string;
  max_turns?: number;
}

export interface Message {
  id: string;
  room_id: string;
  agent_id: string | null;
  role: string;
  content: string;
  turn_number: number;
  created_at: string;
  agent_name: string | null;
  agent_avatar_id: string | null;
}

export interface SimulationStatus {
  room_id: string;
  status: string;
  current_turn_index: number;
  max_turns: number;
}

export interface AvatarDef {
  id: string;
  emoji: string;
  label: string;
}

export interface WSMessage {
  type: "message" | "status" | "typing" | "error";
  message?: Message;
  status?: string;
  current_turn_index?: number;
  max_turns?: number;
  agent_id?: string;
  agent_name?: string;
  error?: string;
}

export interface Provider {
  id: string;
  label: string;
  placeholder: string;
  examples: string;
}

export const PROVIDERS: Provider[] = [
  {
    id: "openrouter",
    label: "OpenRouter",
    placeholder: "anthropic/claude-sonnet-4.5",
    examples: "anthropic/claude-sonnet-4.5 · openai/gpt-4.1 · google/gemini-2.5-pro · deepseek/deepseek-r1",
  },
  {
    id: "openai",
    label: "OpenAI",
    placeholder: "gpt-4.1",
    examples: "gpt-4.1 · gpt-4.1-mini · o3 · o4-mini",
  },
  {
    id: "xai",
    label: "xAI",
    placeholder: "grok-4-1-fast-reasoning",
    examples: "grok-4-1-fast-reasoning · grok-4-1-fast-non-reasoning",
  },
];

export const DEFAULT_PROVIDER = PROVIDERS[0];
export const DEFAULT_MODEL = "openai/gpt-4.1";

export function buildModelString(providerId: string, model: string): string {
  return `litellm/${providerId}/${model}`;
}

export function parseModelString(full: string): { providerId: string; model: string } {
  if (full.startsWith("litellm/")) {
    const withoutPrefix = full.slice("litellm/".length);
    const slashIdx = withoutPrefix.indexOf("/");
    if (slashIdx !== -1) {
      return {
        providerId: withoutPrefix.slice(0, slashIdx),
        model: withoutPrefix.slice(slashIdx + 1),
      };
    }
  }
  return { providerId: DEFAULT_PROVIDER.id, model: full };
}

export function displayModel(full: string): string {
  return parseModelString(full).model;
}
