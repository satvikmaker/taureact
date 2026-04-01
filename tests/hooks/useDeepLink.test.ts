import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { listen } from "@tauri-apps/api/event";
import { useDeepLink } from "@/hooks/useDeepLink";

vi.mocked(listen);

describe("useDeepLink", () => {
  let capturedHandler: ((event: { payload: string }) => void) | null = null;

  beforeEach(() => {
    capturedHandler = null;
    vi.mocked(listen).mockImplementation((_event, handler) => {
      capturedHandler = handler as (event: { payload: string }) => void;
      return Promise.resolve(() => {});
    });
  });

  it("returns null initially", () => {
    const { result } = renderHook(() => useDeepLink());
    expect(result.current).toBeNull();
  });

  it("returns URL when deep-link event is received", async () => {
    const { result } = renderHook(() => useDeepLink());

    await act(async () => {
      capturedHandler?.({ payload: "taureact://open/settings" });
    });

    expect(result.current).toBe("taureact://open/settings");
  });
});
