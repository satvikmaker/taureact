import { describe, it, expect, vi, beforeEach } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import { useThemeStore } from "@/store/themeStore";

vi.mocked(invoke);

describe("themeStore", () => {
  beforeEach(() => {
    useThemeStore.setState({ mode: "system", resolved: "light" });
    document.documentElement.classList.remove("dark");
  });

  it("has correct initial state", () => {
    const state = useThemeStore.getState();
    expect(state.mode).toBe("system");
    expect(["light", "dark"]).toContain(state.resolved);
  });

  it("setMode updates mode and resolved", () => {
    useThemeStore.getState().setMode("dark");
    const state = useThemeStore.getState();
    expect(state.mode).toBe("dark");
    expect(state.resolved).toBe("dark");
  });

  it("setMode('dark') adds .dark class to html", () => {
    useThemeStore.getState().setMode("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("setMode('light') removes .dark class from html", () => {
    document.documentElement.classList.add("dark");
    useThemeStore.getState().setMode("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("setMode persists to settings via IPC", () => {
    useThemeStore.getState().setMode("dark");
    expect(invoke).toHaveBeenCalledWith("settings_set", {
      key: "theme",
      value: "dark",
    });
  });

  it("hydrate loads saved theme from IPC", async () => {
    vi.mocked(invoke).mockResolvedValueOnce("dark");
    await useThemeStore.getState().hydrate();
    const state = useThemeStore.getState();
    expect(state.mode).toBe("dark");
    expect(state.resolved).toBe("dark");
  });

  it("hydrate defaults to system when no saved theme", async () => {
    vi.mocked(invoke).mockResolvedValueOnce(null);
    await useThemeStore.getState().hydrate();
    expect(useThemeStore.getState().mode).toBe("system");
  });

  it("hydrate handles errors gracefully", async () => {
    vi.mocked(invoke).mockRejectedValueOnce(new Error("store not found"));
    await useThemeStore.getState().hydrate();
    // Should not throw, state remains default
    expect(useThemeStore.getState().mode).toBe("system");
  });
});
