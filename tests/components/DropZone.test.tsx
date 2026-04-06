import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { DropZone } from "@/components/DropZone";

// Mock Tauri window API
let dragDropCallback: ((event: unknown) => void) | null = null;
vi.mock("@tauri-apps/api/window", () => ({
  getCurrentWindow: () => ({
    onDragDropEvent: (cb: (event: unknown) => void) => {
      dragDropCallback = cb;
      return Promise.resolve(() => {
        dragDropCallback = null;
      });
    },
  }),
}));

describe("DropZone", () => {
  beforeEach(() => {
    dragDropCallback = null;
  });

  it("renders default text", () => {
    render(<DropZone onDrop={vi.fn()} />);
    // i18n not initialized in tests — key appears as-is
    expect(screen.getByText("fileDrop.hint")).toBeInTheDocument();
  });

  it("renders children when provided", () => {
    render(
      <DropZone onDrop={vi.fn()}>
        <span>Custom content</span>
      </DropZone>
    );
    expect(screen.getByText("Custom content")).toBeInTheDocument();
  });

  it("shows active state on drag enter event from Tauri", async () => {
    const { container } = render(<DropZone onDrop={vi.fn()} />);

    await act(async () => {
      dragDropCallback?.({ payload: { type: "enter", paths: [], position: { x: 0, y: 0 } } });
    });

    expect(container.firstElementChild!.className).toContain("border-blue-500");
  });

  it("removes active state on drag leave event from Tauri", async () => {
    const { container } = render(<DropZone onDrop={vi.fn()} />);

    await act(async () => {
      dragDropCallback?.({ payload: { type: "enter", paths: [], position: { x: 0, y: 0 } } });
    });
    await act(async () => {
      dragDropCallback?.({ payload: { type: "leave", paths: [], position: { x: 0, y: 0 } } });
    });

    expect(container.firstElementChild!.className).toContain("border-zinc-300");
    expect(container.firstElementChild!.className).not.toContain("border-blue-500");
  });
});
