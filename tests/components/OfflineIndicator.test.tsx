import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

describe("OfflineIndicator", () => {
  it("does not render when feature is disabled", async () => {
    // Default: VITE_ENABLE_OFFLINE_INDICATOR is not 'true'
    const { OfflineIndicator } = await import("@/components/OfflineIndicator");
    const { container } = render(<OfflineIndicator />);
    expect(container.innerHTML).toBe("");
  });
});
