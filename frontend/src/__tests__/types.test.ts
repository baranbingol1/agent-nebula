import { describe, it, expect } from "vitest";
import {
  buildModelString,
  parseModelString,
  displayModel,
  PROVIDERS,
  DEFAULT_PROVIDER,
  DEFAULT_MODEL,
} from "../types";

describe("buildModelString", () => {
  it("builds litellm prefixed string for openrouter", () => {
    expect(buildModelString("openrouter", "openai/gpt-5.2")).toBe(
      "litellm/openrouter/openai/gpt-5.2"
    );
  });

  it("builds litellm prefixed string for openai", () => {
    expect(buildModelString("openai", "gpt-5.2")).toBe("litellm/openai/gpt-5.2");
  });

  it("builds litellm prefixed string for xai", () => {
    expect(buildModelString("xai", "grok-4-1-fast-reasoning")).toBe(
      "litellm/xai/grok-4-1-fast-reasoning"
    );
  });

  it("handles empty model name", () => {
    expect(buildModelString("openai", "")).toBe("litellm/openai/");
  });
});

describe("parseModelString", () => {
  it("parses litellm/openai/gpt-5.2", () => {
    const result = parseModelString("litellm/openai/gpt-5.2");
    expect(result.providerId).toBe("openai");
    expect(result.model).toBe("gpt-5.2");
  });

  it("parses litellm/openrouter/openai/gpt-5.2 (nested slash in model)", () => {
    const result = parseModelString("litellm/openrouter/openai/gpt-5.2");
    expect(result.providerId).toBe("openrouter");
    expect(result.model).toBe("openai/gpt-5.2");
  });

  it("parses litellm/xai/grok-4-1-fast-reasoning", () => {
    const result = parseModelString("litellm/xai/grok-4-1-fast-reasoning");
    expect(result.providerId).toBe("xai");
    expect(result.model).toBe("grok-4-1-fast-reasoning");
  });

  it("falls back to default provider for non-litellm strings", () => {
    const result = parseModelString("gpt-5.2");
    expect(result.providerId).toBe(DEFAULT_PROVIDER.id);
    expect(result.model).toBe("gpt-5.2");
  });

  it("falls back for litellm/ without slash", () => {
    const result = parseModelString("litellm/noslash");
    expect(result.providerId).toBe(DEFAULT_PROVIDER.id);
    expect(result.model).toBe("litellm/noslash");
  });

  it("handles empty string", () => {
    const result = parseModelString("");
    expect(result.providerId).toBe(DEFAULT_PROVIDER.id);
    expect(result.model).toBe("");
  });
});

describe("displayModel", () => {
  it("displays model name from full litellm string", () => {
    expect(displayModel("litellm/openai/gpt-5.2")).toBe("gpt-5.2");
  });

  it("displays nested model name from openrouter", () => {
    expect(displayModel("litellm/openrouter/openai/gpt-5.2")).toBe("openai/gpt-5.2");
  });

  it("displays raw string if not litellm format", () => {
    expect(displayModel("gpt-5.2")).toBe("gpt-5.2");
  });
});

describe("parseModelString and buildModelString roundtrip", () => {
  it("roundtrips openai model", () => {
    const original = "litellm/openai/gpt-5.2";
    const { providerId, model } = parseModelString(original);
    expect(buildModelString(providerId, model)).toBe(original);
  });

  it("roundtrips openrouter model with nested slash", () => {
    const original = "litellm/openrouter/openai/gpt-5.2";
    const { providerId, model } = parseModelString(original);
    expect(buildModelString(providerId, model)).toBe(original);
  });

  it("roundtrips xai model", () => {
    const original = "litellm/xai/grok-4-1-fast-reasoning";
    const { providerId, model } = parseModelString(original);
    expect(buildModelString(providerId, model)).toBe(original);
  });
});

describe("PROVIDERS constant", () => {
  it("has at least 3 providers", () => {
    expect(PROVIDERS.length).toBeGreaterThanOrEqual(3);
  });

  it("each provider has required fields", () => {
    for (const p of PROVIDERS) {
      expect(p.id).toBeTruthy();
      expect(p.label).toBeTruthy();
      expect(p.placeholder).toBeTruthy();
      expect(p.examples).toBeTruthy();
    }
  });

  it("has openrouter, openai, xai providers", () => {
    const ids = PROVIDERS.map((p) => p.id);
    expect(ids).toContain("openrouter");
    expect(ids).toContain("openai");
    expect(ids).toContain("xai");
  });
});

describe("DEFAULT_MODEL", () => {
  it("is a valid model string", () => {
    expect(DEFAULT_MODEL).toBe("openai/gpt-5.2");
  });
});

describe("DEFAULT_PROVIDER", () => {
  it("is the first provider (openrouter)", () => {
    expect(DEFAULT_PROVIDER.id).toBe("openrouter");
  });
});
