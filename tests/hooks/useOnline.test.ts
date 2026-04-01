import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOnline } from "@/hooks/useOnline";

describe("useOnline", () => {
  it("returns true when navigator.onLine is true", () => {
    Object.defineProperty(navigator, "onLine", { value: true, writable: true });
    const { result } = renderHook(() => useOnline());
    expect(result.current).toBe(true);
  });

  it("updates when online/offline events fire", () => {
    Object.defineProperty(navigator, "onLine", { value: true, writable: true });
    const { result } = renderHook(() => useOnline());

    act(() => {
      Object.defineProperty(navigator, "onLine", { value: false, writable: true });
      window.dispatchEvent(new Event("offline"));
    });
    expect(result.current).toBe(false);

    act(() => {
      Object.defineProperty(navigator, "onLine", { value: true, writable: true });
      window.dispatchEvent(new Event("online"));
    });
    expect(result.current).toBe(true);
  });
});
