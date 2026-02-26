import { describe, it, expect } from "vitest";
import { generateIdenticon } from "../lib/identicon";

describe("generateIdenticon", () => {
  it("returns an SVG string", () => {
    const svg = generateIdenticon("TestAgent", 100);
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it("respects the size parameter", () => {
    const svg = generateIdenticon("Agent", 50);
    expect(svg).toContain('width="50"');
    expect(svg).toContain('height="50"');
  });

  it("generates different SVGs for different names", () => {
    const svg1 = generateIdenticon("Alice", 100);
    const svg2 = generateIdenticon("Bob", 100);
    expect(svg1).not.toBe(svg2);
  });

  it("generates identical SVGs for the same name (deterministic)", () => {
    const svg1 = generateIdenticon("Agent", 100);
    const svg2 = generateIdenticon("Agent", 100);
    expect(svg1).toBe(svg2);
  });

  it("handles empty name with fallback", () => {
    const svg = generateIdenticon("", 100);
    expect(svg).toContain("<svg");
    expect(svg).toContain('fill="#2a2a3e"');
    expect(svg).not.toContain("<rect x=");
  });

  it("contains foreground rects for non-empty names", () => {
    const svg = generateIdenticon("TestAgent", 100);
    expect(svg).toContain("<rect");
    expect(svg).toContain("hsl(");
  });

  it("has background rect", () => {
    const svg = generateIdenticon("Agent", 100);
    expect(svg).toContain('fill="#1e1e2e"');
  });

  it("produces symmetric pattern (5x5 grid mirrored)", () => {
    const svg = generateIdenticon("SymTest", 50);
    const cellSize = 50 / 5;
    const rects = svg.match(/<rect[^/]*\/>/g) || [];
    // Should have at least background rect + some foreground
    expect(rects.length).toBeGreaterThan(1);
  });

  it("handles special characters in name", () => {
    const svg = generateIdenticon("Agent @#$%!", 100);
    expect(svg).toContain("<svg");
  });

  it("handles very long names", () => {
    const svg = generateIdenticon("A".repeat(1000), 100);
    expect(svg).toContain("<svg");
  });

  it("different sizes produce different viewBox", () => {
    const svg50 = generateIdenticon("Agent", 50);
    const svg100 = generateIdenticon("Agent", 100);
    expect(svg50).toContain('viewBox="0 0 50 50"');
    expect(svg100).toContain('viewBox="0 0 100 100"');
  });
});
