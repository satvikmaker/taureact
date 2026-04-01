import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePlatform } from "@/hooks/usePlatform";

describe("usePlatform", () => {
  it("returns a valid platform string", () => {
    const { result } = renderHook(() => usePlatform());
    expect(["macos", "windows", "linux", "unknown"]).toContain(result.current);
  });

  it("returns consistent value across re-renders", () => {
    const { result, rerender } = renderHook(() => usePlatform());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});
