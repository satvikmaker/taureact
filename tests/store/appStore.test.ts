import { describe, it, expect, beforeEach } from "vitest";
import { useAppStore } from "@/store/appStore";

describe("appStore", () => {
  beforeEach(() => {
    useAppStore.setState({
      version: "0.0.0",
      isMaximized: false,
      lastRoute: "/",
      isOnline: true,
      platform: "unknown",
    });
  });

  it("has correct initial state", () => {
    const state = useAppStore.getState();
    expect(state.version).toBe("0.0.0");
    expect(state.isMaximized).toBe(false);
    expect(state.lastRoute).toBe("/");
    expect(state.platform).toBe("unknown");
  });

  it("setVersion updates version", () => {
    useAppStore.getState().setVersion("1.2.3");
    expect(useAppStore.getState().version).toBe("1.2.3");
  });

  it("setMaximized updates isMaximized", () => {
    useAppStore.getState().setMaximized(true);
    expect(useAppStore.getState().isMaximized).toBe(true);
  });

  it("setLastRoute updates lastRoute", () => {
    useAppStore.getState().setLastRoute("/settings");
    expect(useAppStore.getState().lastRoute).toBe("/settings");
  });

  it("setOnline updates isOnline", () => {
    useAppStore.getState().setOnline(false);
    expect(useAppStore.getState().isOnline).toBe(false);
  });

  it("setPlatform updates platform", () => {
    useAppStore.getState().setPlatform("macos");
    expect(useAppStore.getState().platform).toBe("macos");
  });
});
