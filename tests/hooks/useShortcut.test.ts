import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useShortcut } from "@/hooks/useShortcut";

describe("useShortcut", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fires callback when matching key combo is pressed", () => {
    const callback = vi.fn();
    renderHook(() => useShortcut("CmdOrCtrl+K", "Test", callback));

    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true })
    );
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("does not fire callback for non-matching combos", () => {
    const callback = vi.fn();
    renderHook(() => useShortcut("CmdOrCtrl+K", "Test", callback));

    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "j", metaKey: true })
    );
    expect(callback).not.toHaveBeenCalled();
  });

  it("unregisters on unmount — callback no longer fires", () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() =>
      useShortcut("CmdOrCtrl+K", "Test", callback)
    );

    unmount();

    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true })
    );
    expect(callback).not.toHaveBeenCalled();
  });

  it("fires each shortcut exactly once with multiple hooks", () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    renderHook(() => {
      useShortcut("CmdOrCtrl+K", "Action 1", cb1);
      useShortcut("CmdOrCtrl+J", "Action 2", cb2);
    });

    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true })
    );
    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb2).not.toHaveBeenCalled();
  });
});
