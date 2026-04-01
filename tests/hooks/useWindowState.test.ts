import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useWindowState } from "@/hooks/useWindowState";

vi.mocked(getCurrentWindow);

describe("useWindowState", () => {
  it("returns isMaximized and control functions", () => {
    const { result } = renderHook(() => useWindowState());
    expect(typeof result.current.isMaximized).toBe("boolean");
    expect(typeof result.current.minimize).toBe("function");
    expect(typeof result.current.maximize).toBe("function");
    expect(typeof result.current.close).toBe("function");
  });
});
