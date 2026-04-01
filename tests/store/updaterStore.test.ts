import { describe, it, expect, beforeEach } from "vitest";
import { useUpdaterStore } from "@/store/updaterStore";

describe("updaterStore", () => {
  beforeEach(() => {
    useUpdaterStore.getState().reset();
  });

  it("has correct initial state", () => {
    const state = useUpdaterStore.getState();
    expect(state.status).toBe("idle");
    expect(state.info).toBeNull();
    expect(state.progress).toBeNull();
    expect(state.error).toBeNull();
  });

  it("setAvailable transitions to available status", () => {
    const info = { version: "2.0.0", date: "2026-04-01" };
    useUpdaterStore.getState().setAvailable(info);
    const state = useUpdaterStore.getState();
    expect(state.status).toBe("available");
    expect(state.info).toEqual(info);
    expect(state.error).toBeNull();
  });

  it("setProgress transitions to downloading status", () => {
    const progress = { total: 1000, transferred: 500 };
    useUpdaterStore.getState().setProgress(progress);
    const state = useUpdaterStore.getState();
    expect(state.status).toBe("downloading");
    expect(state.progress).toEqual(progress);
  });

  it("setDownloaded transitions to ready status", () => {
    useUpdaterStore.getState().setProgress({ total: 1000, transferred: 1000 });
    useUpdaterStore.getState().setDownloaded();
    const state = useUpdaterStore.getState();
    expect(state.status).toBe("ready");
    expect(state.progress).toBeNull();
  });

  it("setError transitions to error status", () => {
    useUpdaterStore.getState().setError("Network error");
    const state = useUpdaterStore.getState();
    expect(state.status).toBe("error");
    expect(state.error).toBe("Network error");
  });

  it("reset clears all state", () => {
    useUpdaterStore.getState().setAvailable({ version: "2.0.0" });
    useUpdaterStore.getState().setProgress({ total: 100, transferred: 50 });
    useUpdaterStore.getState().reset();
    const state = useUpdaterStore.getState();
    expect(state.status).toBe("idle");
    expect(state.info).toBeNull();
    expect(state.progress).toBeNull();
    expect(state.error).toBeNull();
  });
});
