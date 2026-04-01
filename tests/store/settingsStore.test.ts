import { describe, it, expect, vi, beforeEach } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import { useSettingsStore } from "@/store/settingsStore";

vi.mocked(invoke);

describe("settingsStore", () => {
  beforeEach(() => {
    useSettingsStore.setState({ cache: {} });
    vi.clearAllMocks();
  });

  it("has empty cache initially", () => {
    expect(useSettingsStore.getState().cache).toEqual({});
  });

  it("get returns undefined for missing key", () => {
    expect(useSettingsStore.getState().get("missing")).toBeUndefined();
  });

  it("set updates cache and calls IPC", async () => {
    vi.mocked(invoke).mockResolvedValueOnce(undefined);
    await useSettingsStore.getState().set("theme", "dark");
    expect(useSettingsStore.getState().get("theme")).toBe("dark");
    expect(invoke).toHaveBeenCalledWith("settings_set", {
      key: "theme",
      value: "dark",
    });
  });

  it("load fetches from IPC and caches", async () => {
    vi.mocked(invoke).mockResolvedValueOnce("saved-value");
    const result = await useSettingsStore.getState().load("myKey");
    expect(result).toBe("saved-value");
    expect(useSettingsStore.getState().get("myKey")).toBe("saved-value");
  });
});
