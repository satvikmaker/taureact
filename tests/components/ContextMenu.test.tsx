import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ContextMenu, type ContextMenuAction } from "@/components/ContextMenu";

const actions: ContextMenuAction[] = [
  { id: "copy", label: "Copy", onClick: vi.fn() },
  { id: "paste", label: "Paste", onClick: vi.fn() },
];

describe("ContextMenu", () => {
  it("renders children", () => {
    render(
      <ContextMenu actions={actions}>
        <div>Content</div>
      </ContextMenu>
    );
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("shows menu on right-click", () => {
    render(
      <ContextMenu actions={actions}>
        <div>Content</div>
      </ContextMenu>
    );
    fireEvent.contextMenu(screen.getByText("Content"));
    expect(screen.getByText("Copy")).toBeInTheDocument();
    expect(screen.getByText("Paste")).toBeInTheDocument();
  });

  it("closes menu on click outside", () => {
    render(
      <ContextMenu actions={actions}>
        <div>Content</div>
      </ContextMenu>
    );
    fireEvent.contextMenu(screen.getByText("Content"));
    expect(screen.getByText("Copy")).toBeInTheDocument();

    fireEvent.click(window);
    expect(screen.queryByText("Copy")).not.toBeInTheDocument();
  });

  it("fires action callback on click", () => {
    render(
      <ContextMenu actions={actions}>
        <div>Content</div>
      </ContextMenu>
    );
    fireEvent.contextMenu(screen.getByText("Content"));
    fireEvent.click(screen.getByText("Copy"));
    expect(actions[0].onClick).toHaveBeenCalled();
  });
});
