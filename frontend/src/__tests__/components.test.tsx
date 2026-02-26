import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatusBadge from "../components/shared/StatusBadge";
import EmptyState from "../components/shared/EmptyState";
import Avatar from "../components/shared/Avatar";

describe("StatusBadge", () => {
  it("renders idle status", () => {
    render(<StatusBadge status="idle" />);
    expect(screen.getByText("idle")).toBeInTheDocument();
  });

  it("renders running status", () => {
    render(<StatusBadge status="running" />);
    expect(screen.getByText("running")).toBeInTheDocument();
  });

  it("renders paused status", () => {
    render(<StatusBadge status="paused" />);
    expect(screen.getByText("paused")).toBeInTheDocument();
  });

  it("renders stopped status", () => {
    render(<StatusBadge status="stopped" />);
    expect(screen.getByText("stopped")).toBeInTheDocument();
  });

  it("renders unknown status with idle fallback styling", () => {
    render(<StatusBadge status="unknown" />);
    expect(screen.getByText("unknown")).toBeInTheDocument();
  });
});

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(
      <EmptyState
        icon={<span data-testid="icon">Icon</span>}
        title="No items"
        description="Nothing to show"
      />
    );
    expect(screen.getByText("No items")).toBeInTheDocument();
    expect(screen.getByText("Nothing to show")).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("renders action when provided", () => {
    render(
      <EmptyState
        icon={<span>Icon</span>}
        title="Empty"
        description="Desc"
        action={<button>Add Item</button>}
      />
    );
    expect(screen.getByText("Add Item")).toBeInTheDocument();
  });

  it("does not render action when not provided", () => {
    render(
      <EmptyState icon={<span>Icon</span>} title="Empty" description="Desc" />
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("Avatar", () => {
  it("renders with default medium size", () => {
    const { container } = render(<Avatar name="TestBot" />);
    const div = container.firstElementChild as HTMLElement;
    expect(div.className).toContain("w-10");
    expect(div.className).toContain("h-10");
  });

  it("renders small size", () => {
    const { container } = render(<Avatar name="Bot" size="sm" />);
    const div = container.firstElementChild as HTMLElement;
    expect(div.className).toContain("w-8");
    expect(div.className).toContain("h-8");
  });

  it("renders large size", () => {
    const { container } = render(<Avatar name="Bot" size="lg" />);
    const div = container.firstElementChild as HTMLElement;
    expect(div.className).toContain("w-14");
    expect(div.className).toContain("h-14");
  });

  it("renders SVG identicon content", () => {
    const { container } = render(<Avatar name="TestBot" />);
    const div = container.firstElementChild as HTMLElement;
    expect(div.innerHTML).toContain("<svg");
  });

  it("different names produce different avatars", () => {
    const { container: c1 } = render(<Avatar name="Alice" />);
    const { container: c2 } = render(<Avatar name="Bob" />);
    const svg1 = (c1.firstElementChild as HTMLElement).innerHTML;
    const svg2 = (c2.firstElementChild as HTMLElement).innerHTML;
    expect(svg1).not.toBe(svg2);
  });
});
